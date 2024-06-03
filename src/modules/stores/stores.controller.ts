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
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AUTH, ERoleType, FIRST_PAGE, GIFT, LIMIT_PAGE, STORE, USER } from 'src/constants';
import { Store } from 'src/database';
import { IToken } from 'src/interfaces';
import { UserGuard } from 'src/utils';
import { AuthUser, Roles } from 'src/utils/decorators';
import { RolesGuard } from 'src/utils/guards/roles.guard';
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
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post('/register')
  async register(@Body() createStoreDto: CreateStoreDto) {
    const data = await this.storesService.register(createStoreDto);
    return { message: AUTH.REGISTER_SUCCESSFULLY, data };
  }

  @Post('/login')
  async login(@Body() payload: LoginStoreDto) {
    const data = await this.storesService.login(payload);
    return { message: AUTH.LOGIN_SUCCESSFULLY, data };
  }

  @Post('/logout')
  @Roles(ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  async logout(@Body() data: IToken, @Headers('authorization') authHeader: string) {
    const accessToken = authHeader.split(' ')[1];
    await this.storesService.logout(data, accessToken);
    return { message: AUTH.LOGOUT_SUCCESSFULLY };
  }

  @Patch('/verify')
  async verify(@Body() otpDto: OtpDto) {
    await this.storesService.verifyOtp(otpDto);
    return { message: STORE.VERIFY_OTP_SUCCESSFULLY };
  }

  @Patch('/send-otp')
  async sendOtp(@Body() emailDto: EmailDto) {
    await this.storesService.sendOtp(emailDto);
    return { message: STORE.SEND_OTP_SUCCESSFULLY };
  }

  @Patch('/verify-store/:id')
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async verifyStore(@Param('id', ParseIntPipe) id: number) {
    await this.storesService.verifyStore(id);
    return { message: STORE.VERIFY_STORE_SUCCESSFULLY };
  }

  @Post('/users')
  @Roles(ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  async createUserInStore(@Body() createUserDto: CreateUserStoreDto, @AuthUser() store) {
    const data = await this.storesService.createUserInStore(createUserDto, store);
    return { message: STORE.ADD_USER_IN_STORE_SUCCESSFULLY, data };
  }

  @Post('/users/register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    const data = await this.storesService.registerUser(createUserDto);
    return { message: AUTH.REGISTER_SUCCESSFULLY, data };
  }

  @Patch('/users/:id')
  @Roles(ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  async updateUserInStore(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserStoreDto,
    @AuthUser() store
  ) {
    const data = await this.storesService.updateUserInStore(id, updateUserDto, store);
    return { message: STORE.ADD_USER_IN_STORE_SUCCESSFULLY, data };
  }

  @Delete('/users/:id')
  @Roles(ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  async deleteUserInStore(@Param('id', ParseIntPipe) id: number, @AuthUser() store) {
    await this.storesService.deleteUserInStore(id, store);
    return { message: STORE.DELETE_USER_IN_STORE_SUCCESSFULLY };
  }

  @Get('/users/:id')
  @Roles(ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  async getUserInStore(@Param('id', ParseIntPipe) id: number, @AuthUser() store) {
    const data = await this.storesService.getUsersInStore(id, store);
    return { message: USER.GET_USER_SUCCESSFULLY, data };
  }

  @Get('/users')
  @Roles(ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  async getAllUsersInStore(@AuthUser() store) {
    const data = await this.storesService.getAllUsersInStore(store);
    return { message: STORE.GET_ALL_USER_IN_STORE_SUCCESSFULLY, data };
  }

  @Post()
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async create(@Body() createStoreDto: CreateStoreDto) {
    const data = await this.storesService.create(createStoreDto);
    return { message: STORE.CREATE_STORE_SUCCESSFULLY, data };
  }

  @Patch(':id')
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateStoreDTO: UpdateStoreDto) {
    const data = await this.storesService.update(id, updateStoreDTO);
    return { message: STORE.UPDATE_STORE_SUCCESSFULLY, data };
  }

  @Delete(':id')
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.storesService.remove(id);
    return { message: STORE.DELETE_STORE_SUCCESSFULLY };
  }

  @Get()
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    const data = await this.storesService.findAll(page || FIRST_PAGE, limit || LIMIT_PAGE);
    return { message: STORE.GET_ALL_STORE_SUCCESSFULLY, data };
  }

  @Get(':id')
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.storesService.findOne(id);
    return { message: STORE.GET_STORE_SUCCESSFULLY, data };
  }

  @Post('/gifts')
  @Roles(ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createGift(
    @Body() createGiftDto: CreateGiftDto,
    @UploadedFile() image: Express.Multer.File,
    @AuthUser() store
  ) {
    const data = await this.storesService.createGift(createGiftDto, image, store);
    return { message: GIFT.CREATE_GIFT_SUCCESSFULLY, data };
  }

  @Patch('/gifts/:id')
  @Roles(ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  async updateGift(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateGiftDto, @AuthUser() store: Store) {
    const data = await this.storesService.updateGift(id, body, store);
    return { message: GIFT.UPDATE_GIFT_SUCCESSFULLY, data };
  }

  @Delete('/gifts/:id')
  @Roles(ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  async deleteGift(@Param('id', ParseIntPipe) id: number, @AuthUser() store: Store) {
    await this.storesService.removeGift(id, store);
    return { message: GIFT.DELETE_GIFT_SUCCESSFULLY };
  }

  @Get('/gifts/:id')
  @Roles(ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  async getGift(@Param('id', ParseIntPipe) id: number, @AuthUser() store: Store) {
    const data = await this.storesService.findOneGift(id, store);
    return { message: GIFT.GET_GIFT_SUCCESSFULLY, data };
  }

  @Get('/store/gifts/all')
  @Roles(ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  async getAllGifts(@AuthUser() store) {
    const data = await this.storesService.findAllGifts(store);
    return { message: GIFT.GET_ALL_GIFT_IN_STORE_SUCCESSFULLY, data };
  }

  @Patch('/forgot-password/send-token')
  async forgotPassword(@Body() body: EmailDto) {
    await this.storesService.forgotPassword(body);
    return { message: STORE.SEND_FORGOT_PASSWORD_TOKEN_SUCCESS };
  }

  @Patch('/reset-password/reset')
  async resetPassword(@Query('forgot_password_token') forgotToken: string, @Body() body: PasswordDto) {
    await this.storesService.resetPassword(forgotToken, body);
    return { message: STORE.RESET_PASSWORD_SUCCESS };
  }
}
