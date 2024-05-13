import { Injectable } from '@nestjs/common';
import { token } from 'src/configs';
import { ADMIN } from 'src/constants';
import { IToken } from 'src/interfaces';
import { EncryptHelper, ErrorHelper, TokenHelper } from 'src/utils';
import { AdminRepository } from './admin.repository';
import { LoginAdminDto } from './dto/login-admin.dtos';

@Injectable()
export class AdminService {
  constructor(private adminRepository: AdminRepository) {}

  private generateToken(payload: object): IToken {
    const { token: accessToken, expires } = TokenHelper.generate(payload, token.secretKey, token.expireTime);
    const { token: refreshToken } = TokenHelper.generate(payload, token.rfSecretKey, token.rfExpireTime);

    return {
      accessToken,
      expires,
      refreshToken
    };
  }

  async login(body: LoginAdminDto): Promise<object> {
    const { password, email } = body;

    const admin = await this.adminRepository.findOne({
      where: {
        email
      }
    });
    if (!admin) {
      ErrorHelper.BadRequestException(ADMIN.ADMIN_NOT_FOUND);
    }
    if (password && !admin.password) ErrorHelper.BadRequestException(ADMIN.INVALID_PASSWORD);

    const token = this.generateToken({ id: admin.id, role: admin.role });
    delete admin.password;
    return {
      ...token,
      admin
    };
  }
}
