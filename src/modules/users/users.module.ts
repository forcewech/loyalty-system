import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from 'src/database';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersRepository } from './users.repository';
import { TwilioModule } from '../twilio/twilio.module';
import { RanksModule } from '../ranks';
import { GiftsModule } from '../gifts/gifts.module';
import { RefreshTokensModule } from '../refresh_tokens';
import { StoreUsersModule } from '../store_users';
import { UserRewardsModule } from '../user_rewards';
@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    TwilioModule,
    RanksModule,
    GiftsModule,
    RefreshTokensModule,
    StoreUsersModule,
    UserRewardsModule
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository]
})
export class UsersModule {}
