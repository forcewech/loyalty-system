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
import { RanksRepository } from '../ranks';
import { RefreshTokensRepository } from '../refresh_tokens';
import { StoreUsersRepository } from '../store_users';
import { TwilioService } from '../twilio/twilio.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { OtpDto } from './dto/otp.dto';
import { PhoneDto } from './dto/phone.dto';
import { RedeemToCartDto } from './dto/redeem-to-cart.dts';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private twilioService: TwilioService,
    private ranksRepository: RanksRepository,
    private giftsRepository: GiftsRepository,
    private refreshTokensRepository: RefreshTokensRepository,
    private storeUsersRepository: StoreUsersRepository,
    private orderRedeemDetailsRepository: OrderRedeemDetailsRepository,
    private orderRedeemsRepository: OrderRedeemsRepository,
    private productStoresRepository: ProductStoresRepository
  ) {}

  async register(body: CreateUserDto): Promise<User> {
    const payload = body;
    const otpCode = await CommonHelper.generateOTP();
    const hashPassword = await EncryptHelper.hash(payload.password);
    await this.twilioService.sendSms('+18777804236', `Your OTP code is: ${otpCode}`);
    const rank = await this.ranksRepository.findOne({
      where: {
        name: 'bronze'
      }
    });
    const isPhoneExists = await this.usersRepository.findOne({
      where: {
        phone: payload.phone
      }
    });
    if (isPhoneExists) {
      ErrorHelper.BadRequestException(USER.PHONE_IS_EXIST);
    }
    payload['rankId'] = rank.id;
    const user = await this.usersRepository.create({
      ...payload,
      password: hashPassword,
      otpCode: otpCode,
      codeExpireTime: new Date().setMinutes(new Date().getMinutes() + EXPIRE_TIME_OTP)
    });
    const userData = user.get({ plain: true });
    delete userData.password;
    delete userData.otpCode;
    delete userData.codeExpireTime;
    delete userData.isCodeUsed;
    delete userData.createdAt;
    delete userData.updatedAt;
    delete userData.deletedAt;
    return {
      ...userData
    };
  }

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

  //User management
  async create(body: CreateUserDto): Promise<User> {
    const hashPassword = await EncryptHelper.hash(body.password);
    const rank = await this.ranksRepository.findOne({
      where: {
        name: 'bronze'
      }
    });
    body['rankId'] = rank.id;
    const isPhoneExists = await this.usersRepository.findOne({
      where: {
        phone: body.phone
      }
    });
    if (isPhoneExists) {
      ErrorHelper.BadRequestException(USER.PHONE_IS_EXIST);
    }
    const isEmailExists = await this.usersRepository.findOne({
      where: {
        email: body.email
      }
    });
    if (isEmailExists) {
      ErrorHelper.BadRequestException(USER.EMAIL_IS_EXIST);
    }
    const user = await this.usersRepository.create({
      ...body,
      password: hashPassword,
      status: EUserStatus.ACTIVE
    });
    await this.storeUsersRepository.create({
      userId: user.id,
      storeId: body.storeId,
      rankId: user.rankId
    });
    const userData = user.get({ plain: true });
    delete userData.password;
    delete userData.otpCode;
    delete userData.codeExpireTime;
    delete userData.isCodeUsed;
    delete userData.createdAt;
    delete userData.updatedAt;
    delete userData.deletedAt;
    return {
      ...userData
    };
  }

  async update(id: number, body: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        id
      }
    });
    if (!user) {
      ErrorHelper.BadRequestException(USER.USER_NOT_FOUND);
    }
    const payload = body.password ? { ...body, password: await EncryptHelper.hash(body.password) } : body;
    if (payload.phone) {
      const isPhoneExists = await this.usersRepository.findOne({
        where: {
          phone: payload.phone
        }
      });
      if (isPhoneExists && isPhoneExists.phone !== user.phone) {
        ErrorHelper.BadRequestException(USER.PHONE_IS_EXIST);
      }
    }
    Object.assign(user, payload);
    await user.save();
    const userData = user.get({ plain: true });
    delete userData.password;
    delete userData.otpCode;
    delete userData.codeExpireTime;
    delete userData.isCodeUsed;
    delete userData.createdAt;
    delete userData.updatedAt;
    delete userData.deletedAt;
    return {
      ...userData
    };
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        id
      }
    });
    if (!user) {
      ErrorHelper.BadRequestException(USER.USER_NOT_FOUND);
    }
    await this.usersRepository.delete({
      where: {
        id
      }
    });
  }

  async findAll(page, limit): Promise<IPaginationRes<User>> {
    return await this.usersRepository.paginate(
      {
        attributes: {
          exclude: ['password', 'otpCode', 'codeExpireTime', 'isCodeUsed', 'createdAt', 'updatedAt', 'deletedAt']
        }
      },
      page,
      limit
    );
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        id
      },
      attributes: {
        exclude: ['password', 'otpCode', 'codeExpireTime', 'isCodeUsed', 'createdAt', 'updatedAt', 'deletedAt']
      }
    });
    if (!user) {
      ErrorHelper.BadRequestException(USER.USER_NOT_FOUND);
    }
    return user.get({ plain: true });
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
    const userData = await this.usersRepository.findOne({
      where: {
        id: user.id
      }
    });
    const cart = await this.orderRedeemDetailsRepository.find({ raw: true });
    const order = await this.orderRedeemsRepository.create({
      userId: user.id,
      rankId: userData.rankId,
      redeemDate: new Date()
    });
    for (const item of cart) {
      if (item.status === EGiftStatus.NOT_REDEEMED && item.userId === user.id) {
        totalPoints += item.totalPrices;

        // Cập nhật chi tiết đổi thưởng
        await this.orderRedeemDetailsRepository.update(
          { orderRedeemId: order.id, status: EGiftStatus.REDEEMED },
          { where: { id: item.id } }
        );

        // Lấy thông tin quà tặng
        const gift = await this.giftsRepository.findOne({
          where: {
            id: item.productId
          }
        });

        // Cập nhật số lượng quà tặng
        gift['quantity'] -= item.quantity;
        await gift.save();
      }
    }
    // Cập nhật điểm thưởng của người dùng
    userData['rewardPoints'] = userData.rewardPoints - totalPoints;
    await userData.save();
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
