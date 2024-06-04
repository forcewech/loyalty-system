import { Injectable } from '@nestjs/common';
import { token } from 'src/configs';
import { client } from 'src/configs/connectRedis';
import { AUTH, EGiftStatus, EUserStatus, EXPIRE_TIME_OTP, GIFT, STORE, USER } from 'src/constants';
import { Gift, OrderRedeemDetail, User } from 'src/database';
import { IPaginationRes, IToken, ITokenPayload } from 'src/interfaces';
import { CommonHelper, EncryptHelper, ErrorHelper, TokenHelper } from 'src/utils';
import { GiftsRepository } from '../gifts/gifts.repository';
import { OrderRedeemDetailsRepository } from '../order_redeem_details';
import { OrderRedeemsRepository } from '../order_redeems';
import { ProductStoresRepository } from '../product_stores';
import { RefreshTokensRepository } from '../refresh_tokens';
import { TwilioService } from '../twilio/twilio.service';
import { LoginUserDto } from './dto/login-user.dto';
import { OtpDto } from './dto/otp.dto';
import { PhoneDto } from './dto/phone.dto';
import { RedeemToCartDto } from './dto/redeem-to-cart.dts';
import { UsersRepository } from './users.repository';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class UsersService {
  constructor(
    private sequelize: Sequelize,
    private usersRepository: UsersRepository,
    private twilioService: TwilioService,
    private giftsRepository: GiftsRepository,
    private refreshTokensRepository: RefreshTokensRepository,
    private orderRedeemDetailsRepository: OrderRedeemDetailsRepository,
    private orderRedeemsRepository: OrderRedeemsRepository,
    private productStoresRepository: ProductStoresRepository
  ) {}

  async sendOtp(payload: PhoneDto): Promise<void> {
    const OTP = CommonHelper.generateOTP();
    const isPhoneExists = await this.usersRepository.findOne({
      where: {
        phone: payload.phone
      }
    });
    if (!isPhoneExists) {
      ErrorHelper.BadRequestException(USER.THIS_PHONE_HAS_NOT_REGISTERED);
    }
    await this.twilioService.sendSms('+18777804236', `Your OTP code is: ${OTP}`);
    await this.usersRepository.update(
      { otpCode: OTP, codeExpireTime: new Date().setMinutes(new Date().getMinutes() + EXPIRE_TIME_OTP) },
      {
        where: {
          phone: payload.phone
        }
      }
    );
  }
  async verifyOtp(body: OtpDto): Promise<void> {
    const payload = body;
    const data = await this.usersRepository.findOne({
      where: {
        otpCode: payload.otpCode
      }
    });
    if (!data) {
      ErrorHelper.BadRequestException(USER.INCORRECT_OTP);
    }
    if (new Date().getMinutes() - data.codeExpireTime.getMinutes() > EXPIRE_TIME_OTP) {
      ErrorHelper.BadRequestException(USER.EXPIRE_TIME_OTP);
    }
    await this.usersRepository.update(
      { status: EUserStatus.ACTIVE },
      {
        where: {
          id: data.id
        }
      }
    );
  }
  private generateToken(payload: object): IToken {
    const { token: accessToken, expires } = TokenHelper.generate(payload, token.secretKey, token.expireTime);
    const { token: refreshToken } = TokenHelper.generate(payload, token.rfSecretKey, token.rfExpireTime);

    return {
      accessToken,
      expires,
      refreshToken
    };
  }

  async login(body: LoginUserDto): Promise<IToken> {
    const { password, phone } = body;

    const user = await this.usersRepository.findOne({
      where: {
        phone
      }
    });
    if (!user) {
      ErrorHelper.BadRequestException(USER.USER_NOT_FOUND);
    }
    const isValidPassword = await EncryptHelper.compare(password, user.password);
    if (!isValidPassword) ErrorHelper.BadRequestException(USER.INVALID_PASSWORD);
    if (user.status === EUserStatus.INACTIVE) {
      ErrorHelper.BadRequestException(USER.NOT_VERIFIED_OTP);
    }
    const tokenData = this.generateToken({ id: user.id, role: user.role });
    const key = `user_${tokenData.accessToken}`;
    const expireTime = parseInt(token.expireTime.slice(0, -1)) * 60;
    await client.set(key, tokenData.accessToken, {
      EX: expireTime
    });
    await this.refreshTokensRepository.create({
      token: tokenData.refreshToken,
      userId: user.id,
      expiryDate: tokenData.expires
    });
    delete user.password;
    return {
      ...tokenData
    };
  }

  async logout(data: IToken, accessToken: string): Promise<void> {
    const refreshToken = await this.refreshTokensRepository.findOne({
      where: {
        token: data.refreshToken
      }
    });
    if (!refreshToken) {
      ErrorHelper.BadRequestException(AUTH.REFRESH_TOKEN_NOT_EXIST);
    }
    await this.refreshTokensRepository.delete({
      where: {
        token: data.refreshToken
      }
    });
    await client.del(`user_${accessToken}`);
  }
  async redeemGift(productId: number, user: User, data: RedeemToCartDto): Promise<void> {
    const quantityRedeem = data.quantity;
    const isGiftInStore = await this.productStoresRepository.findOne({
      where: {
        productId,
        storeId: data.storeId
      }
    });
    if (!isGiftInStore) {
      ErrorHelper.BadRequestException(STORE.GIFT_IS_NOT_EXSIT_IN_STORE);
    }
    const giftData = await this.giftsRepository.findOne({
      where: {
        id: productId
      }
    });
    if (!giftData) {
      ErrorHelper.BadRequestException(GIFT.GIFT_NOT_FOUND);
    }
    const dataUser = await this.usersRepository.findOne({
      where: {
        id: user.id
      }
    });
    const totalPrices = +giftData.redemptionPoints * quantityRedeem;
    if (quantityRedeem > giftData.quantity) {
      ErrorHelper.BadRequestException(GIFT.NOT_ENOUGH_QUANTITY);
    }
    if (totalPrices > dataUser.rewardPoints) {
      ErrorHelper.BadRequestException(USER.NOT_ENOUGH_POINT);
    }
    if (giftData.expirationDate < new Date()) {
      ErrorHelper.BadRequestException(GIFT.GIFT_HAS_RAN_OUT_OF_TIME_TO_REDEEM);
    }
    await this.orderRedeemDetailsRepository.create({
      userId: user.id,
      rankId: dataUser.rankId,
      productId,
      quantity: quantityRedeem,
      totalPrices
    });
  }

  async removeGift(id: number, user: User): Promise<void> {
    const gift = await this.orderRedeemDetailsRepository.findOne({
      where: {
        id
      }
    });
    if (!gift) {
      ErrorHelper.BadRequestException(GIFT.GIFT_NOT_IN_CART);
    }
    if (gift.status === EGiftStatus.NOT_REDEEMED && gift.userId === user.id) {
      await this.orderRedeemDetailsRepository.delete({
        where: {
          id
        }
      });
    } else {
      ErrorHelper.BadRequestException(GIFT.GIFT_NOT_IN_CART);
    }
  }

  async getPayment(user: User): Promise<void> {
    let totalPoints = 0;
    const transaction = await this.sequelize.transaction();
    try {
      const userData = await this.usersRepository.findOne({
        where: {
          id: user.id
        },
        transaction
      });
      const cart = await this.orderRedeemDetailsRepository.find({ raw: true, transaction });
      const order = await this.orderRedeemsRepository.create(
        {
          userId: user.id,
          rankId: userData.rankId,
          redeemDate: new Date()
        },
        { transaction }
      );
      for (const item of cart) {
        if (item.status === EGiftStatus.NOT_REDEEMED && item.userId === user.id) {
          totalPoints += item.totalPrices;

          // Cập nhật chi tiết đổi thưởng
          await this.orderRedeemDetailsRepository.update(
            { orderRedeemId: order.id, status: EGiftStatus.REDEEMED },
            { where: { id: item.id }, transaction }
          );

          // Lấy thông tin quà tặng
          const gift = await this.giftsRepository.findOne({
            where: {
              id: item.productId
            },
            transaction
          });

          // Cập nhật số lượng quà tặng
          gift['quantity'] -= item.quantity;
          await gift.save({ transaction });
        }
      }
      // Cập nhật điểm thưởng của người dùng
      userData['rewardPoints'] = userData.rewardPoints - totalPoints;
      await userData.save({ transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getItemInCart(page, limit, user): Promise<IPaginationRes<OrderRedeemDetail>> {
    return await this.orderRedeemDetailsRepository.paginate(
      {
        where: {
          status: EGiftStatus.NOT_REDEEMED,
          userId: user.id
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      },
      page,
      limit
    );
  }

  async getHistoryRedeem(user: User) {
    return await this.orderRedeemsRepository.find({
      where: {
        userId: user.id
      },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        {
          model: OrderRedeemDetail,
          attributes: { exclude: ['createdAt', 'updatedAt', 'userId', 'rankId', 'productId'] },
          include: [
            {
              model: Gift,
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
            }
          ]
        }
      ]
    });
  }

  async refreshToken(refreshToken: string): Promise<IToken> {
    const rfToken = await this.refreshTokensRepository.findOne({
      where: {
        token: refreshToken
      }
    });
    if (!rfToken) {
      ErrorHelper.BadRequestException(AUTH.REFRESH_TOKEN_NOT_EXIST);
    }
    await this.refreshTokensRepository.delete({
      where: {
        token: refreshToken
      }
    });
    const data = TokenHelper.verify(refreshToken, token.rfSecretKey) as ITokenPayload;
    const tokenData = this.generateToken({ id: data.id, role: data.role });
    const key = `user_${tokenData.accessToken}`;
    const expireTime = parseInt(token.expireTime.slice(0, -1)) * 60;
    await client.set(key, tokenData.accessToken, {
      EX: expireTime
    });
    await this.refreshTokensRepository.create({
      token: tokenData.refreshToken,
      userId: data.id,
      expiryDate: tokenData.expires
    });
    return {
      ...tokenData
    };
  }
}
