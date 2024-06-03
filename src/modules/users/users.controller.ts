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
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Post('/refresh-token')
  async refreshToken(@Body() body: IToken) {
    const data = await this.usersService.refreshToken(body.refreshToken);
    return { message: AUTH.GET_ACCESS_TOKEN_AND_REFRESH_TOKEN_SUCCESS, data };
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

  @Get('/history-redeem')
  @Roles(ERoleType.CLIENT)
  @UseGuards(UserGuard, RolesGuard)
  async getHistory(@AuthUser() user) {
    const data = await this.usersService.getHistoryRedeem(user);
    return { message: USER.GET_HISTORY_REDEEM_GIFT_SUCCESSFULLY, data };
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

  @Delete('/redeem-gift/:id')
  @Roles(ERoleType.CLIENT)
  @UseGuards(UserGuard, RolesGuard)
  async deleteRedeemGift(@Param('id', ParseIntPipe) id: number, @AuthUser() user) {
    await this.usersService.removeGift(id, user);
    return { message: USER.REMOVE_GIFT_IN_CART_SUCCESSFULLY };
  }

  @Get('/cart')
  @Roles(ERoleType.CLIENT)
  @UseGuards(UserGuard, RolesGuard)
  async getGiftInCart(@Query('page') page: number, @Query('limit') limit: number, @AuthUser() user) {
    const data = await this.usersService.getItemInCart(page || FIRST_PAGE, limit || LIMIT_PAGE, user);
    return { message: USER.GET_GIFT_IN_CART_SUCCESSFULLY, data };
  }
}
