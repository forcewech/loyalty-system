import { Injectable } from '@nestjs/common';
import { token } from 'src/configs';
import { client } from 'src/configs/connectRedis';
import { ADMIN, AUTH } from 'src/constants';
import { IToken } from 'src/interfaces';
import { EncryptHelper, ErrorHelper, TokenHelper } from 'src/utils';
import { RefreshTokensRepository } from '../refresh_tokens';
import { AdminRepository } from './admin.repository';
import { LoginAdminDto } from './dto/login-admin.dtos';
import { CreateAdminDto } from './dto/create-admin.dtos';
import { Admin } from 'src/database';

@Injectable()
export class AdminService {
  constructor(
    private adminRepository: AdminRepository,
    private refreshTokensRepository: RefreshTokensRepository
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
}
