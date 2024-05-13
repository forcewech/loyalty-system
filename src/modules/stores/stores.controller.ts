import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { OtpDto } from './dto/otp.dto';
import { EmailDto } from './dto/email.dto';
import { Roles } from 'src/utils/decorators';
import { ERoleType } from 'src/constants';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import { UserGuard } from 'src/utils/guards';
import { LoginStoreDto } from './dto/login-store.dtos';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.register(createStoreDto);
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
