import { Injectable } from '@nestjs/common';
import { token } from 'src/configs';
import { client } from 'src/configs/connectRedis';
import { ADMIN, AUTH, EUserStatus, STORE, USER } from 'src/constants';
import { IPaginationRes, IToken } from 'src/interfaces';
import { EncryptHelper, ErrorHelper, TokenHelper } from 'src/utils';
import { RefreshTokensRepository } from '../refresh_tokens';
import { AdminRepository } from './admin.repository';
import { LoginAdminDto } from './dto/login-admin.dtos';
import { CreateAdminDto } from './dto/create-admin.dtos';
import { Admin, User } from 'src/database';
import { UsersRepository } from '../users';
import { StoreUsersRepository } from '../store_users';
import { RanksRepository } from '../ranks';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { StoresRepository } from '../stores';

@Injectable()
export class AdminService {
  constructor(
    private adminRepository: AdminRepository,
    private refreshTokensRepository: RefreshTokensRepository,
    private usersRepository: UsersRepository,
    private ranksRepository: RanksRepository,
    private storeUsersRepository: StoreUsersRepository,
    private storesRepository: StoresRepository
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

  async create(payload: CreateAdminDto): Promise<Admin> {
    const { password } = payload;
    const hashPassword = await EncryptHelper.hash(password);
    const admin = await this.adminRepository.create({ ...payload, password: hashPassword });
    const adminData = admin.get({ plain: true });
    delete adminData.password;
    return {
      ...adminData
    };
  }

  async login(body: LoginAdminDto): Promise<IToken> {
    const { password, email } = body;
    const admin = await this.adminRepository.findOne({
      where: {
        email
      }
    });
    if (!admin) {
      ErrorHelper.BadRequestException(ADMIN.ADMIN_NOT_FOUND);
    }
    const isValidPassword = await EncryptHelper.compare(password, admin.password);
    if (!isValidPassword) ErrorHelper.BadRequestException(ADMIN.INVALID_PASSWORD);
    const tokenData = this.generateToken({ id: admin.id, role: admin.role });
    const key = `user_${tokenData.accessToken}`;
    const expireTime = parseInt(token.expireTime.slice(0, -1)) * 60;
    await client.set(key, tokenData.accessToken, {
      EX: expireTime
    });
    await this.refreshTokensRepository.create({
      token: tokenData.refreshToken,
      adminId: admin.id,
      expiryDate: tokenData.expires
    });
    delete admin.password;
    return {
      ...tokenData
    };
  }

  async createUser(body: CreateUserAdminDto): Promise<User> {
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
    const store = await this.storesRepository.findOne({
      where: {
        id: body.storeId
      }
    });
    if (!store) {
      ErrorHelper.BadRequestException(STORE.STORE_NOT_FOUND);
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

  async updateUser(id: number, body: UpdateUserAdminDto): Promise<User> {
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
    if (payload.storeId) {
      await this.storeUsersRepository.update(
        {
          storeId: body.storeId
        },
        {
          where: {
            userId: id
          }
        }
      );
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

  async removeUser(id: number): Promise<void> {
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

  async findAllUser(page, limit): Promise<IPaginationRes<User>> {
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

  async findOneUser(id: number): Promise<User> {
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
}
