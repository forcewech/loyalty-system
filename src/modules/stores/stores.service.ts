import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { token } from 'src/configs';
import { EStoreStatus, EXPIRE_TIME_OTP, STORE } from 'src/constants';
import { Store, User } from 'src/database';
import { IToken } from 'src/interfaces';
import { CommonHelper, EncryptHelper, ErrorHelper, TokenHelper } from 'src/utils';
import { StoreUsersRepository } from '../store_users';
import { UsersRepository } from '../users';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { EmailDto } from './dto/email.dto';
import { LoginStoreDto } from './dto/login-store.dtos';
import { OtpDto } from './dto/otp.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoresRepository } from './stores.repository';

@Injectable()
export class StoresService {
  constructor(
    private storesRepository: StoresRepository,
    private storeUsersRepository: StoreUsersRepository,
    private usersRepository: UsersRepository,
    @InjectQueue('send-mail')
    private sendMail: Queue
  ) {}

  async createUserInStore(body: CreateUserDto, store: Store) {
    const payload = body;
    const hashPassword = await EncryptHelper.hash(payload.password);
    const data = await this.usersRepository.create({ ...payload, password: hashPassword });
    return await this.storeUsersRepository.create({
      storeId: store.id,
      rankId: data.rankId,
      userId: data.id
    });
  }

  async updateUserInStore(id: number, body: UpdateUserDto, store: Store) {
    const hashPassword = await EncryptHelper.hash(body.password);
    const payload = body.password ? { ...body, password: hashPassword } : body;
    const isUserInStore = await this.storeUsersRepository.findOne({
      where: {
        userId: id,
        storeId: store.id
      }
    });
    if (!isUserInStore) {
      ErrorHelper.BadRequestException(STORE.USER_NOT_IN_STORE);
    }
    return await this.usersRepository.update(
      { ...payload },
      {
        where: {
          id
        }
      }
    );
  }

  async deleteUserInStore(id: number, store: Store) {
    const isUserInStore = await this.storeUsersRepository.findOne({
      where: {
        userId: id,
        storeId: store.id
      }
    });
    if (!isUserInStore) {
      ErrorHelper.BadRequestException(STORE.USER_NOT_IN_STORE);
    }
    return await this.usersRepository.delete({
      where: {
        id
      }
    });
  }

  async getUsersInStore(store: Store) {
    return await this.storeUsersRepository.find({
      where: {
        storeId: store.id
      },
      attributes: ['storeId'],
      include: [
        {
          model: User,
          attributes: ['fullName', 'email']
        }
      ]
    });
  }

  async register(body: CreateStoreDto) {
    const OTP = CommonHelper.generateOTP();
    const payload = body;
    const hashPassword = await EncryptHelper.hash(payload.password);
    const store = await this.storesRepository.create({
      ...payload,
      password: hashPassword,
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
    const storeData = store.get({ plain: true });
    delete storeData.password;
    delete storeData.otpCode;
    delete storeData.codeExpireTime;
    return {
      storeData
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
    const isValidPassword = await EncryptHelper.compare(password, store.password);
    if (!isValidPassword) ErrorHelper.BadRequestException(STORE.INVALID_PASSWORD);
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
