import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { EStoreStatus, EXPIRE_TIME_OTP, STORE } from 'src/constants';
import { CommonHelper, ErrorHelper, TokenHelper } from 'src/utils';
import { CreateStoreDto } from './dto/create-store.dto';
import { EmailDto } from './dto/email.dto';
import { OtpDto } from './dto/otp.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoresRepository } from './stores.repository';
import { IToken } from 'src/interfaces';
import { token } from 'src/configs';
import { LoginStoreDto } from './dto/login-store.dtos';

@Injectable()
export class StoresService {
  constructor(
    private storesRepository: StoresRepository,
    @InjectQueue('send-mail')
    private sendMail: Queue
  ) {}

  async register(body: CreateStoreDto) {
    const OTP = CommonHelper.generateOTP();
    const payload = body;
    const store = await this.storesRepository.create({
      ...payload,
      otpCode: OTP,
      codeExpireTime: new Date().setMinutes(new Date().getMinutes() + EXPIRE_TIME_OTP)
    });
    await this.sendMail.add(
      'register',
      {
        to: payload.email,
        otp: OTP
      },
      {
        removeOnComplete: true
      }
    );
    return {
      store
    };
  }

  async sendOtp(payload: EmailDto) {
    const OTP = CommonHelper.generateOTP();
    await this.sendMail.add(
      'register',
      {
        to: payload.email,
        otp: OTP
      },
      {
        removeOnComplete: true
      }
    );
    await this.storesRepository.update(
      { otpCode: OTP, codeExpireTime: new Date().setMinutes(new Date().getMinutes() + EXPIRE_TIME_OTP) },
      {
        where: {
          email: payload.email
        }
      }
    );
  }

  async verifyOtp(body: OtpDto) {
    const payload = body;
    const data = await this.storesRepository.findOne({
      where: {
        otpCode: payload.otpCode
      }
    });
    if (!data) {
      ErrorHelper.BadRequestException(STORE.INCORRECT_OTP);
    }
    if (new Date().getMinutes() - data.codeExpireTime.getMinutes() > EXPIRE_TIME_OTP) {
      ErrorHelper.BadRequestException(STORE.EXPIRE_TIME_OTP);
    }
    const updateStore = await this.storesRepository.update(
      { isCodeUsed: true },
      {
        where: {
          id: data.id
        }
      }
    );
    return {
      updateStore
    };
  }
  async verifyStore(id: number) {
    const data = await this.storesRepository.findOne({
      where: {
        id
      }
    });
    if (!data.isCodeUsed) {
      ErrorHelper.BadRequestException(STORE.STORE_HAS_NOT_VERIFIED_OTP);
    }
    await this.storesRepository.update(
      {
        status: EStoreStatus.ACTIVE
      },
      {
        where: {
          id
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

  async login(body: LoginStoreDto): Promise<object> {
    const { password, email } = body;

    const store = await this.storesRepository.findOne({
      where: {
        email
      }
    });
    if (!store) {
      ErrorHelper.BadRequestException(STORE.STORE_NOT_FOUND);
    }
    if (password && !store.password) ErrorHelper.BadRequestException(STORE.INVALID_PASSWORD);
    if (store.status === EStoreStatus.INACTIVE) {
      ErrorHelper.BadRequestException(STORE.STORE_HAS_NOT_VERIFIED);
    }
    const token = this.generateToken({ id: store.id, role: store.role });
    delete store.password;
    return {
      ...token,
      store
    };
  }

  async findAll() {
    return this.storesRepository.find();
  }

  async findOne(id: number) {
    return this.storesRepository.findOne({
      where: {
        id
      }
    });
  }

  async update(id: number, body: UpdateStoreDto) {
    const payload = body;
    const updateStore = await this.storesRepository.update(
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
      updateStore
    };
  }

  async remove(id: number) {
    return this.storesRepository.delete({
      where: {
        id
      }
    });
  }
}
