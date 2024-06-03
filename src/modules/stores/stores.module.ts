import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Store } from 'src/database';
import { GiftsModule } from '../gifts/gifts.module';
import { ProductStoresModule } from '../product_stores';
import { RanksModule } from '../ranks';
import { RefreshTokensModule } from '../refresh_tokens';
import { StoreUsersModule } from '../store_users';
import { TwilioModule } from '../twilio/twilio.module';
import { UploadsModule } from '../upload/uploads.module';
import { UsersModule } from '../users';
import { EmailConsumer } from './consumers/email.consumer';
import { StoresController } from './stores.controller';
import { StoresRepository } from './stores.repository';
import { StoresService } from './stores.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Store]),
    BullModule.registerQueue({
      name: 'send-mail'
    }),
    StoreUsersModule,
    UsersModule,
    TwilioModule,
    RanksModule,
    RefreshTokensModule,
    UploadsModule,
    ProductStoresModule,
    GiftsModule
  ],
  controllers: [StoresController],
  providers: [StoresService, StoresRepository, EmailConsumer],
  exports: [StoresRepository]
})
export class StoresModule {}
