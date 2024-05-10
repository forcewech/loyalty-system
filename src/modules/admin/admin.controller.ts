import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto/login-admin.dtos';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/login')
  async login(@Body() payload: LoginAdminDto) {
    return this.adminService.login(payload);
  }
}
