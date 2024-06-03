import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { token } from 'src/configs';
import { client } from 'src/configs/connectRedis';
import { AUTH, EStoreStatus, EUserStatus, EXPIRE_TIME_OTP, GIFT, STORE, USER } from 'src/constants';
import { Gift, Store, User } from 'src/database';
import { IPaginationRes, IToken, ITokenPayload } from 'src/interfaces';
import { CommonHelper, EncryptHelper, ErrorHelper, TokenHelper } from 'src/utils';
import { GiftsRepository } from '../gifts/gifts.repository';
import { ProductStoresRepository } from '../product_stores';
import { RanksRepository } from '../ranks';
import { RefreshTokensRepository } from '../refresh_tokens';
import { StoreUsersRepository } from '../store_users';
import { TwilioService } from '../twilio/twilio.service';
import { UploadsService } from '../upload';
import { UsersRepository } from '../users';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateGiftDto } from './dto/create-gift.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { CreateUserStoreDto } from './dto/create-user-store.dto';
import { EmailDto } from './dto/email.dto';
import { LoginStoreDto } from './dto/login-store.dtos';
import { OtpDto } from './dto/otp.dto';
import { PasswordDto } from './dto/password.dto';
import { UpdateGiftDto } from './dto/update-gift.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateUserStoreDto } from './dto/update-user-store.dto';
import { StoresRepository } from './stores.repository';

@Injectable()
export class StoresService {
  constructor(
    private storesRepository: StoresRepository,
    private twilioService: TwilioService,
    private storeUsersRepository: StoreUsersRepository,
    private usersRepository: UsersRepository,
    private ranksRepository: RanksRepository,
    private refreshTokensRepository: RefreshTokensRepository,
    private uploadsService: UploadsService,
    private giftsRepository: GiftsRepository,
    private productStoresRepository: ProductStoresRepository,
    @InjectQueue('send-mail')
    private sendMail: Queue
  ) {}

  private generateToken(payload: object): IToken {
    const { token: accessToken, expires } = TokenHelper.generate(payload, token.secretKey, token.expireTime);
    const { token: refreshToken } = TokenHelper.generate(payload, token.rfSecretKey, token.rfExpireTime);

    return {
      accessToken,
      expires,
      refreshToken
    };
  }

  async register(body: CreateStoreDto): Promise<Store> {
    const OTP = CommonHelper.generateOTP();
    const payload = body;
    const hashPassword = await EncryptHelper.hash(payload.password);
    const isEmailExists = await this.storesRepository.findOne({
      where: {
        email: payload.email
      }
    });
    if (isEmailExists) {
      ErrorHelper.BadRequestException(STORE.EMAIL_IS_EXIST);
    }
    const isNameExists = await this.storesRepository.findOne({
      where: {
        name: payload.name
      }
    });
    if (isNameExists) {
      ErrorHelper.BadRequestException(STORE.NAME_IS_EXIST);
    }
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
    delete storeData.isCodeUsed;
    delete storeData.createdAt;
    delete storeData.updatedAt;
    delete storeData.deletedAt;
    return {
      ...storeData
    };
  }

  async sendOtp(payload: EmailDto): Promise<void> {
    const OTP = CommonHelper.generateOTP();
    const isEmailExists = await this.storesRepository.findOne({
      where: {
        email: payload.email
      }
    });
    if (!isEmailExists) {
      ErrorHelper.BadRequestException(STORE.THIS_EMAIL_HAS_NOT_REGISTERED);
    }
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

  async verifyOtp(body: OtpDto): Promise<void> {
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
  }

  async verifyStore(id: number): Promise<void> {
    const data = await this.storesRepository.findOne({
      where: {
        id
      }
    });
    if (!data) {
      ErrorHelper.BadRequestException(STORE.STORE_NOT_FOUND);
    }
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
    if (!store.isCodeUsed) {
      ErrorHelper.BadRequestException(STORE.NOT_VERIFIED_OTP);
    }
    const tokenData = this.generateToken({ id: store.id, role: store.role });
    const key = `user_${tokenData.accessToken}`;
    const expireTime = parseInt(token.expireTime.slice(0, -1)) * 60;
    await client.set(key, tokenData.accessToken, {
      EX: expireTime
    });
    await this.refreshTokensRepository.create({
      token: tokenData.refreshToken,
      storeId: store.id,
      expiryDate: tokenData.expires
    });
    delete store.password;
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

  async createUserInStore(body: CreateUserStoreDto, store: Store): Promise<User> {
    const payload = body;
    const hashPassword = await EncryptHelper.hash(payload.password);
    const rank =
      (await this.ranksRepository.findOne({
        where: {
          name: 'bronze'
        }
      })) || null;
    if (payload.phone) {
      const isPhoneExists = await this.usersRepository.findOne({
        where: {
          phone: payload.phone
        }
      });
      if (isPhoneExists) {
        ErrorHelper.BadRequestException(USER.PHONE_IS_EXIST);
      }
    }
    if (payload.email) {
      const isEmailExists = await this.usersRepository.findOne({
        where: {
          email: payload.email
        }
      });
      if (isEmailExists) {
        ErrorHelper.BadRequestException(USER.EMAIL_IS_EXIST);
      }
    }
    const user = await this.usersRepository.create({
      ...payload,
      password: hashPassword,
      rankId: rank.id,
      status: EUserStatus.ACTIVE
    });
    await this.storeUsersRepository.create({
      storeId: store.id,
      rankId: user.rankId,
      userId: user.id
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

  async updateUserInStore(id: number, body: UpdateUserStoreDto, store: Store): Promise<User> {
    const payload = body.password ? { ...body, password: await EncryptHelper.hash(body.password) } : body;
    const user = await this.usersRepository.findOne({
      where: {
        id
      }
    });
    if (!user) {
      ErrorHelper.BadRequestException(USER.USER_NOT_FOUND);
    }
    const isUserInStore = await this.storeUsersRepository.findOne({
      where: {
        userId: id,
        storeId: store.id
      }
    });
    if (!isUserInStore) {
      ErrorHelper.BadRequestException(STORE.USER_NOT_IN_STORE);
    }
    if (payload.email) {
      const isEmailExists = await this.usersRepository.findOne({
        where: {
          email: payload.email
        }
      });
      if (isEmailExists && isEmailExists.email !== user.email) {
        ErrorHelper.BadRequestException(USER.EMAIL_IS_EXIST);
      }
    }
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

  async deleteUserInStore(id: number, store: Store): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        id
      }
    });
    if (!user) {
      ErrorHelper.BadRequestException(USER.USER_NOT_FOUND);
    }
    const isUserInStore = await this.storeUsersRepository.findOne({
      where: {
        userId: id,
        storeId: store.id
      }
    });
    if (!isUserInStore) {
      ErrorHelper.BadRequestException(STORE.USER_NOT_IN_STORE);
    }
    await this.usersRepository.delete({
      where: {
        id
      }
    });
  }

  async getUsersInStore(id: number, store: Store): Promise<User> {
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
    const userInSore = await this.storeUsersRepository.findOne({
      where: {
        userId: id,
        storeId: store.id
      }
    });
    if (!userInSore) {
      ErrorHelper.BadRequestException(STORE.USER_NOT_IN_STORE);
    }
    return user;
  }

  async getAllUsersInStore(store: Store): Promise<Store> {
    return await this.storesRepository.findOne({
      where: {
        id: store.id
      },
      attributes: {
        exclude: [
          'createdAt',
          'updatedAt',
          'deletedAt',
          'password',
          'otpCode',
          'codeExpireTime',
          'isCodeUsed',
          'typePoint'
        ]
      },
      include: [
        {
          model: User,
          attributes: [
            'id',
            'fullName',
            'email',
            'gender',
            'phone',
            'rewardPoints',
            'reservePoints',
            'role',
            'status',
            'rankId'
          ],
          through: {
            attributes: [] // Ẩn thuộc tính của StoreUser
          }
        }
      ]
    });
  }

  //Store management
  async create(body: CreateStoreDto): Promise<Store> {
    const hashPassword = await EncryptHelper.hash(body.password);
    const isEmailExists = await this.storesRepository.findOne({
      where: {
        email: body.email
      }
    });
    if (isEmailExists) {
      ErrorHelper.BadRequestException(STORE.EMAIL_IS_EXIST);
    }
    const isNameExists = await this.storesRepository.findOne({
      where: {
        name: body.name
      }
    });
    if (isNameExists) {
      ErrorHelper.BadRequestException(STORE.NAME_IS_EXIST);
    }
    const store = await this.storesRepository.create({
      ...body,
      password: hashPassword,
      status: EStoreStatus.ACTIVE,
      isCodeUsed: true
    });
    const storeData = store.get({ plain: true });
    delete storeData.password;
    delete storeData.otpCode;
    delete storeData.codeExpireTime;
    delete storeData.isCodeUsed;
    delete storeData.createdAt;
    delete storeData.updatedAt;
    delete storeData.deletedAt;
    return {
      ...storeData
    };
  }

  async update(id: number, body: UpdateStoreDto): Promise<Store> {
    const store = await this.storesRepository.findOne({
      where: {
        id
      }
    });
    if (!store) {
      ErrorHelper.BadRequestException(STORE.STORE_NOT_FOUND);
    }
    const payload = body.password ? { ...body, password: await EncryptHelper.hash(body.password) } : body;
    if (payload.email) {
      const isEmailExists = await this.storesRepository.findOne({
        where: {
          email: payload.email
        }
      });
      if (isEmailExists && isEmailExists.email !== store.email) {
        ErrorHelper.BadRequestException(STORE.EMAIL_IS_EXIST);
      }
    }
    if (payload.name) {
      const isNameExists = await this.storesRepository.findOne({
        where: {
          name: payload.name
        }
      });
      if (isNameExists && isNameExists.name !== store.name) {
        ErrorHelper.BadRequestException(STORE.NAME_IS_EXIST);
      }
    }
    Object.assign(store, payload);
    await store.save();
    const storeData = store.get({ plain: true });
    delete storeData.password;
    delete storeData.otpCode;
    delete storeData.codeExpireTime;
    delete storeData.isCodeUsed;
    delete storeData.createdAt;
    delete storeData.updatedAt;
    delete storeData.deletedAt;
    return {
      ...storeData
    };
  }

  async remove(id: number): Promise<void> {
    const store = await this.storesRepository.findOne({
      where: {
        id
      }
    });
    if (!store) {
      ErrorHelper.BadRequestException(STORE.STORE_NOT_FOUND);
    }
    await this.storesRepository.delete({
      where: {
        id
      }
    });
  }

  async findAll(page, limit): Promise<IPaginationRes<Store>> {
    return await this.storesRepository.paginate(
      {
        attributes: {
          exclude: ['password', 'otpCode', 'codeExpireTime', 'isCodeUsed', 'createdAt', 'updatedAt', 'deletedAt']
        }
      },
      page,
      limit
    );
  }

  async findOne(id: number): Promise<Store> {
    const store = await this.storesRepository.findOne({
      where: {
        id
      },
      attributes: {
        exclude: ['password', 'otpCode', 'codeExpireTime', 'isCodeUsed', 'createdAt', 'updatedAt', 'deletedAt']
      }
    });
    if (!store) {
      ErrorHelper.BadRequestException(STORE.STORE_NOT_FOUND);
    }
    return store.get({ plain: true });
  }

  //Manage gifts
  async createGift(body: CreateGiftDto, image: Express.Multer.File, store: Store): Promise<Gift> {
    const payload = body;
    const isGiftExist = await this.giftsRepository.findOne({
      where: {
        name: payload.name
      }
    });
    if (isGiftExist) {
      ErrorHelper.BadRequestException(GIFT.GIFT_IS_EXSIT);
    }
    if (new Date(payload.expirationDate) < new Date()) {
      ErrorHelper.BadRequestException(GIFT.DATE_IS_NOT_IN_THE_PAST);
    }
    const imageUrl = await this.uploadsService.uploadImage(image);
    const { url } = imageUrl;
    const gift = await this.giftsRepository.create({ ...payload, image: url });
    await this.productStoresRepository.create({
      storeId: store.id,
      productId: gift.id
    });
    const giftData = gift.get({ plain: true });
    delete giftData.createdAt;
    delete giftData.updatedAt;
    delete giftData.deletedAt;
    return { ...giftData };
  }

  async updateGift(id: number, body: UpdateGiftDto, store: Store): Promise<Gift> {
    const gift = await this.giftsRepository.findOne({
      where: {
        id
      }
    });
    if (!gift) {
      ErrorHelper.BadRequestException(GIFT.GIFT_NOT_FOUND);
    }
    if (body.expirationDate) {
      if (new Date(body.expirationDate) < new Date()) {
        ErrorHelper.BadRequestException(GIFT.DATE_IS_NOT_IN_THE_PAST);
      }
    }
    const isGiftInStore = await this.productStoresRepository.findOne({
      where: {
        productId: id,
        storeId: store.id
      }
    });
    if (!isGiftInStore) {
      ErrorHelper.BadRequestException(GIFT.GIFT_NOT_IN_STORE);
    }
    Object.assign(gift, body);
    await gift.save();
    const giftData = gift.get({ plain: true });
    delete giftData.createdAt;
    delete giftData.updatedAt;
    delete giftData.deletedAt;
    return {
      ...giftData
    };
  }

  async removeGift(id: number, store: Store): Promise<void> {
    const gift = await this.giftsRepository.findOne({
      where: {
        id
      }
    });
    if (!gift) {
      ErrorHelper.BadRequestException(GIFT.GIFT_NOT_FOUND);
    }
    const isGiftInStore = await this.productStoresRepository.findOne({
      where: {
        productId: id,
        storeId: store.id
      }
    });
    if (!isGiftInStore) {
      ErrorHelper.BadRequestException(GIFT.GIFT_NOT_IN_STORE);
    }
    await this.giftsRepository.delete({
      where: { id }
    });
  }

  async findOneGift(id: number, store: Store): Promise<Gift> {
    const gift = await this.giftsRepository.findOne({
      where: {
        id
      },
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    });
    if (!gift) {
      ErrorHelper.BadRequestException(GIFT.GIFT_NOT_FOUND);
    }
    const isGiftInStore = await this.productStoresRepository.findOne({
      where: {
        productId: id,
        storeId: store.id
      }
    });
    if (!isGiftInStore) {
      ErrorHelper.BadRequestException(GIFT.GIFT_NOT_IN_STORE);
    }
    return gift;
  }

  async findAllGifts(store: Store): Promise<Store[]> {
    return await this.storesRepository.find({
      where: {
        id: store.id
      },
      attributes: {
        exclude: [
          'createdAt',
          'updatedAt',
          'deletedAt',
          'password',
          'otpCode',
          'codeExpireTime',
          'isCodeUsed',
          'typePoint'
        ]
      },
      include: [
        {
          model: Gift,
          attributes: ['id', 'name', 'redemptionPoints', 'expirationDate', 'quantity', 'description', 'image'],
          through: {
            attributes: [] // Ẩn thuộc tính của StoreUser
          }
        }
      ]
    });
  }

  async forgotPassword(body: EmailDto): Promise<void> {
    const storeData = await this.storesRepository.findOne({
      where: {
        email: body.email
      }
    });
    if (!storeData) {
      ErrorHelper.BadRequestException(STORE.THIS_EMAIL_HAS_NOT_REGISTERED);
    }
    const tokenData = TokenHelper.generate({ email: body.email }, token.secretKey, token.expireTime);
    await this.sendMail.add(
      'register',
      {
        to: body.email,
        otp: `http://localhost:3000/api/stores/reset-password/reset?forgot_password_token=${tokenData.token}`
      },
      {
        removeOnComplete: true
      }
    );
    storeData['forgotPasswordToken'] = tokenData.token;
    await storeData.save();
  }

  async registerUser(body: CreateUserDto): Promise<User> {
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
    const isEmailExists = await this.usersRepository.findOne({
      where: {
        email: payload.email
      }
    });
    if (isEmailExists) {
      ErrorHelper.BadRequestException(USER.EMAIL_IS_EXIST);
    }
    const store = await this.storesRepository.findOne({
      where: {
        id: payload.storeId
      }
    });
    if (!store) {
      ErrorHelper.BadRequestException(STORE.STORE_NOT_FOUND);
    }
    payload['rankId'] = rank.id;
    const user = await this.usersRepository.create({
      ...payload,
      password: hashPassword,
      otpCode: otpCode,
      codeExpireTime: new Date().setMinutes(new Date().getMinutes() + EXPIRE_TIME_OTP)
    });
    await this.storeUsersRepository.create({
      userId: user.id,
      storeId: payload.storeId,
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

  async resetPassword(forgotToken: string, body: PasswordDto): Promise<void> {
    const data = TokenHelper.verify(forgotToken, token.secretKey) as ITokenPayload;
    const store = await this.storesRepository.findOne({
      where: {
        forgotPasswordToken: forgotToken
      }
    });
    if (!store) {
      ErrorHelper.BadRequestException(STORE.FORGOT_PASSWORD_TOKEN_NOT_FOUND);
    }
    if (data) {
      await this.storesRepository.update(
        {
          password: await EncryptHelper.hash(body.password),
          forgotPasswordToken: ''
        },
        {
          where: {
            email: data.email
          }
        }
      );
    }
  }
}
