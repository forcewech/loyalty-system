import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ADMIN, AUTH, ERoleType, FIRST_PAGE, LIMIT_PAGE, USER } from 'src/constants';
import { IToken } from 'src/interfaces';
import { Roles, UserGuard } from 'src/utils';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dtos';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dtos';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/login')
  async login(@Body() payload: LoginAdminDto) {
    const data = await this.adminService.login(payload);
    return { message: AUTH.LOGIN_SUCCESSFULLY, data };
  }

  @Post('/users')
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async createUser(@Body() createUserDto: CreateUserAdminDto) {
    const data = await this.adminService.createUser(createUserDto);
    return { message: USER.CREATE_USER_SUCCESSFULLY, data };
  }

  @Patch('/users/:id')
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserAdminDto) {
    const data = await this.adminService.updateUser(id, updateUserDto);
    return { message: USER.UPDATE_USER_SUCCESSFULLY, data };
  }

  @Delete('/users/:id')
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async removeUser(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.removeUser(id);
    return { message: USER.DELETE_USER_SUCCESSFULLY };
  }

  @Get('/users')
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async findAllUser(@Query('page') page: number, @Query('limit') limit: number) {
    const data = await this.adminService.findAllUser(page || FIRST_PAGE, limit || LIMIT_PAGE);
    return { message: USER.GET_ALL_USER_SUCCESSFULLY, data };
  }

  @Get('/users/:id')
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async findOneUser(@Param('id', ParseIntPipe) id: number) {
    const data = await this.adminService.findOneUser(id);
    return { message: USER.GET_USER_SUCCESSFULLY, data };
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
