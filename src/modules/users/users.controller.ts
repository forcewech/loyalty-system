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
import { AUTH, ERoleType, FIRST_PAGE, LIMIT_PAGE, USER } from 'src/constants';
import { IToken } from 'src/interfaces';
import { AuthUser, Roles, UserGuard } from 'src/utils';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { OtpDto } from './dto/otp.dto';
import { PhoneDto } from './dto/phone.dto';
import { RedeemToCartDto } from './dto/redeem-to-cart.dts';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  async register(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.register(createUserDto);
    return { message: AUTH.REGISTER_SUCCESSFULLY, data };
  }

  @Post('/login')
  async login(@Body() payload: LoginUserDto) {
    const data = await this.usersService.login(payload);
    return { message: AUTH.LOGIN_SUCCESSFULLY, data };
  }

  @Post('/logout')
  @Roles(ERoleType.CLIENT)
  @UseGuards(UserGuard, RolesGuard)
  async logout(@Body() data: IToken, @Headers('authorization') authHeader: string) {
    const accessToken = authHeader.split(' ')[1];
    await this.usersService.logout(data, accessToken);
    return { message: AUTH.LOGOUT_SUCCESSFULLY };
  }

  @Patch('/verify')
  async verify(@Body() otpDto: OtpDto) {
    await this.usersService.verifyOtp(otpDto);
    return { message: USER.VERIFY_OTP_SUCCESSFULLY };
  }

  @Patch('/send-otp')
  async sendOtp(@Body() phoneDto: PhoneDto) {
    await this.usersService.sendOtp(phoneDto);
    return { message: USER.SEND_OTP_SUCCESSFULLY };
  }

  @Post()
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.create(createUserDto);
    return { message: USER.CREATE_USER_SUCCESSFULLY, data };
  }

  @Patch(':id')
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.usersService.update(id, updateUserDto);
    return { message: USER.UPDATE_USER_SUCCESSFULLY, data };
  }

  @Delete(':id')
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
    return { message: USER.DELETE_USER_SUCCESSFULLY };
  }

  @Get()
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    const data = await this.usersService.findAll(page || FIRST_PAGE, limit || LIMIT_PAGE);
    return { message: USER.GET_ALL_USER_SUCCESSFULLY, data };
  }

  @Get('/history-redeem')
  @Roles(ERoleType.CLIENT)
  @UseGuards(UserGuard, RolesGuard)
  async getHistory(@AuthUser() user) {
    const data = await this.usersService.getHistoryRedeem(user);
    return { message: USER.GET_HISTORY_REDEEM_GIFT_SUCCESSFULLY, data };
  }

  @Get(':id')
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.usersService.findOne(id);
    return { message: USER.GET_USER_SUCCESSFULLY, data };
  }

  @Patch('/redeem-gift/:id')
  @Roles(ERoleType.CLIENT)
  @UseGuards(UserGuard, RolesGuard)
  async redeemGift(@Param('id') id: number, @AuthUser() user, @Body() data: RedeemToCartDto) {
    await this.usersService.redeemGift(id, user, data);
    return { message: USER.ADD_GIFT_INTO_CART_SUCCESSFULLY };
  }

  @Patch('/payment/get-payment')
  @Roles(ERoleType.CLIENT)
  @UseGuards(UserGuard, RolesGuard)
  async getPayment(@AuthUser() user) {
    await this.usersService.getPayment(user);
    return { message: USER.REDEEM_GIFT_SUCCESSFULLY };
  }
}
