import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { CommonHelper, EncryptHelper, ErrorHelper, TokenHelper } from 'src/utils';
import { TwilioService } from '../twilio/twilio.service';
import { LoginUserDto } from './dto/login-user.dto';
import { EUserStatus, EXPIRE_TIME_OTP, USER } from 'src/constants';
import { IToken } from 'src/interfaces';
import { token } from 'src/configs';
import { PhoneDto } from './dto/phone.dto';
import { OtpDto } from './dto/otp.dto';
import { RanksRepository } from '../ranks';
import { GiftsRepository } from '../gifts/gifts.repository';
import { User } from 'src/database';
import { GIFT } from 'src/constants/messages/gift.message';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private twilioService: TwilioService,
    private ranksRepository: RanksRepository,
    private giftsRepository: GiftsRepository
  ) {}

  async create(body: CreateUserDto) {
    const payload = body;
    const otpCode = await CommonHelper.generateOTP();
    const hashPassword = await EncryptHelper.hash(payload.password);
    await this.twilioService.sendSms('+18777804236', `Your OTP code is: ${otpCode}`);
    const rank = await this.ranksRepository.findOne({
      where: {
        name: 'bronze'
      }
    });

    payload['rankId'] = rank.id;
    const user = await this.usersRepository.create({
      ...payload,
      password: hashPassword,
      otpCode: otpCode,
      codeExpireTime: new Date().setMinutes(new Date().getMinutes() + EXPIRE_TIME_OTP)
    });
    return {
      user
    };
  }

  async sendOtp(payload: PhoneDto) {
    const OTP = CommonHelper.generateOTP();
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
  async verifyOtp(body: OtpDto) {
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
    const updateUser = await this.usersRepository.update(
      { isCodeUsed: true, status: EUserStatus.ACTIVE },
      {
        where: {
          id: data.id
        }
      }
    );
    return {
      updateUser
    };
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

  async login(body: LoginUserDto): Promise<object> {
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
    const token = this.generateToken({ id: user.id, role: user.role });
    delete user.password;
    return {
      ...token,
      user
    };
  }

  async findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    return this.usersRepository.findOne({
      where: {
        id
      }
    });
  }

  async update(id: number, body: UpdateUserDto) {
    const payload = body.password ? { ...body, password: await EncryptHelper.hash(body.password) } : body;
    const updateUser = await this.usersRepository.update(
      {
        ...payload
      },
      {
        where: {
          id
        }
      }
    );
    return {
      updateUser
    };
  }

  async remove(id: number) {
    return this.usersRepository.delete({
      where: {
        id
      }
    });
  }

  async redeemGift(productId: number, user: User) {
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
    if (+dataUser.rewardPoints > +giftData.redemptionPoints) {
      if (+giftData.quantity > 0) {
        const redeemGift = +dataUser.rewardPoints - +giftData.redemptionPoints;
        dataUser.rewardPoints = redeemGift;
        giftData.quantity -= 1;
      } else {
        ErrorHelper.BadRequestException(GIFT.OUT_OF_STOCK);
      }
    } else {
      ErrorHelper.BadRequestException(USER.NOT_ENOUGH_POINT);
    }
    await giftData.save();
    return await dataUser.save();
  }
}
