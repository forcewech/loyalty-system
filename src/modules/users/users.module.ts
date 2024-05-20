import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from 'src/database';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersRepository } from './users.repository';
import { TwilioModule } from '../twilio/twilio.module';
import { RanksModule } from '../ranks';
import { GiftsModule } from '../gifts/gifts.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), TwilioModule, RanksModule, GiftsModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository]
})
export class UsersModule {}
