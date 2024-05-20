import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { OtpDto } from './dto/otp.dto';
import { PhoneDto } from './dto/phone.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { AuthUser, Roles, UserGuard } from 'src/utils';
import { ERoleType } from 'src/constants';
import { RolesGuard } from 'src/utils/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/login')
  async login(@Body() payload: LoginUserDto) {
    return this.usersService.login(payload);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch('/verify')
  verify(@Body() otpDto: OtpDto) {
    return this.usersService.verifyOtp(otpDto);
  }

  @Patch('/send-otp')
  sendOtp(@Body() phoneDto: PhoneDto) {
    return this.usersService.sendOtp(phoneDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Patch('/redeem-gift/:id')
  @Roles(ERoleType.CLIENT)
  @UseGuards(UserGuard, RolesGuard)
  redeemGift(@Param('id') id: number, @AuthUser() user) {
    return this.usersService.redeemGift(id, user);
  }
}
