import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/database';
import { GiftsModule } from '../gifts/gifts.module';
import { OrderRedeemDetailsModule } from '../order_redeem_details';
import { OrderRedeemsModule } from '../order_redeems';
import { RanksModule } from '../ranks';
import { RefreshTokensModule } from '../refresh_tokens';
import { StoreUsersModule } from '../store_users';
import { TwilioModule } from '../twilio/twilio.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { ProductStoresModule } from '../product_stores';
@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    TwilioModule,
    RanksModule,
    GiftsModule,
    RefreshTokensModule,
    StoreUsersModule,
    OrderRedeemDetailsModule,
    OrderRedeemsModule,
    ProductStoresModule
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository]
})
export class UsersModule {}
