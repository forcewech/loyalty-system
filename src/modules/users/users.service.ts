import { Injectable } from '@nestjs/common';
import { token } from 'src/configs';
import { AUTH, EUserStatus, EXPIRE_TIME_OTP, USER } from 'src/constants';
import { GIFT } from 'src/constants/messages/gift.message';
import { Gift, User, UserReward } from 'src/database';
import { IPaginationRes, IToken } from 'src/interfaces';
import { CommonHelper, EncryptHelper, ErrorHelper, TokenHelper } from 'src/utils';
import { GiftsRepository } from '../gifts/gifts.repository';
import { RanksRepository } from '../ranks';
import { TwilioService } from '../twilio/twilio.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { OtpDto } from './dto/otp.dto';
import { PhoneDto } from './dto/phone.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { client } from 'src/configs/connectRedis';
import { RefreshTokensRepository } from '../refresh_tokens';
import { StoreUsersRepository } from '../store_users';
import { UserRewardsRepository } from '../user_rewards';
import { QuantityRedeemDto } from './dto/quantity-redeem.dts';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private twilioService: TwilioService,
    private ranksRepository: RanksRepository,
    private giftsRepository: GiftsRepository,
    private refreshTokensRepository: RefreshTokensRepository,
    private storeUsersRepository: StoreUsersRepository,
    private userRewardsRepository: UserRewardsRepository
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

  async redeemGift(productId: number, user: User, quantityData: QuantityRedeemDto): Promise<void> {
    const quantityRedeem = quantityData.quantity;
    const giftData = await this.giftsRepository.findOne({
      where: {
        id: productId
      }
    });
    const dataUser = await this.usersRepository.findOne({
      where: {
        id: user.id
      }
    });
    const totalPoints = +giftData.redemptionPoints * +quantityRedeem;
    if (+dataUser.rewardPoints >= totalPoints) {
      if (+giftData.quantity > +quantityRedeem) {
        const redeemGift = +dataUser.rewardPoints - totalPoints;
        dataUser.rewardPoints = redeemGift;
        giftData.quantity -= +quantityRedeem;
      } else {
        ErrorHelper.BadRequestException(GIFT.NOT_ENOUGH_QUANTITY);
      }
    } else {
      ErrorHelper.BadRequestException(USER.NOT_ENOUGH_POINT);
    }
    await this.userRewardsRepository.create({
      userId: dataUser.id,
      rankId: dataUser.rankId,
      productId,
      quantity: quantityRedeem,
      redeemDate: new Date()
    });
    await giftData.save();
    await dataUser.save();
  }

  async getHistoryRedeem(user: User) {
    return await this.userRewardsRepository.find({
      where: {
        userId: user.id
      },
      attributes: { exclude: ['createdAt', 'updatedAt', 'rankId', 'userId', 'productId'] },
      include: [
        {
          model: Gift,
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        }
      ]
    });
  }
}
