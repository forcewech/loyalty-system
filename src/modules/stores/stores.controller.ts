import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ERoleType } from 'src/constants';
import { UserGuard } from 'src/utils';
import { AuthUser, Roles } from 'src/utils/decorators';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import { CreateStoreDto } from './dto/create-store.dto';
import { EmailDto } from './dto/email.dto';
import { LoginStoreDto } from './dto/login-store.dtos';
import { OtpDto } from './dto/otp.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoresService } from './stores.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.register(createStoreDto);
  }

  @Post('/add-user')
  @Roles(ERoleType.ADMIN, ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  createUserInStore(@Body() createUserDto: CreateUserDto, @AuthUser() store) {
    return this.storesService.createUserInStore(createUserDto, store);
  }

  @Patch('/update-user/:id')
  @Roles(ERoleType.ADMIN, ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  updateUserInStore(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @AuthUser() store) {
    return this.storesService.updateUserInStore(id, updateUserDto, store);
  }

  @Delete('/delete-user/:id')
  @Roles(ERoleType.ADMIN, ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  deleteUserInStore(@Param('id') id: number, @AuthUser() store) {
    return this.storesService.deleteUserInStore(id, store);
  }

  @Get('/users')
  @Roles(ERoleType.ADMIN, ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  getUsersInStore(@AuthUser() store) {
    return this.storesService.getUsersInStore(store);
  }

  @Post('/login')
  async login(@Body() payload: LoginStoreDto) {
    return this.storesService.login(payload);
  }

  @Patch('/verify')
  verify(@Body() otpDto: OtpDto) {
    return this.storesService.verifyOtp(otpDto);
  }

  @Patch('/send-otp')
  sendOtp(@Body() emailDto: EmailDto) {
    return this.storesService.sendOtp(emailDto);
  }

  @Patch('/verify-store/:id')
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  verifyStore(@Param('id') id: number) {
    return this.storesService.verifyStore(id);
  }

  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(+id, updateStoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storesService.remove(+id);
  }
}
