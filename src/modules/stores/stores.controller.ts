import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ERoleType } from 'src/constants';
import { UserGuard } from 'src/utils';
import { Roles } from 'src/utils/decorators';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import { CreateStoreDto } from './dto/create-store.dto';
import { EmailDto } from './dto/email.dto';
import { LoginStoreDto } from './dto/login-store.dtos';
import { OtpDto } from './dto/otp.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoresService } from './stores.service';

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
