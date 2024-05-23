import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ADMIN, AUTH } from 'src/constants';
import { IToken } from 'src/interfaces';
import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto/login-admin.dtos';
import { CreateAdminDto } from './dto/create-admin.dtos';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/login')
  async login(@Body() payload: LoginAdminDto) {
    const data = await this.adminService.login(payload);
    return { message: AUTH.LOGIN_SUCCESSFULLY, data };
  }

  @Post()
  async create(@Body() payload: CreateAdminDto) {
    const data = await this.adminService.create(payload);
    return { message: ADMIN.CREATE_ADMIN_SUCCESSFULLY, data };
  }

  @Post('/logout')
  async logout(@Body() data: IToken, @Headers('authorization') authHeader: string) {
    const accessToken = authHeader.split(' ')[1];
    await this.adminService.logout(data, accessToken);
    return { message: AUTH.LOGOUT_SUCCESSFULLY };
  }
}
