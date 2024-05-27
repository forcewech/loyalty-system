import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Store } from 'src/database';
import { EmailConsumer } from './consumers/email.consumer';
import { StoresController } from './stores.controller';
import { StoresRepository } from './stores.repository';
import { StoresService } from './stores.service';
import { StoreUsersModule } from '../store_users';
import { UsersModule } from '../users';
import { RanksModule } from '../ranks';
import { RefreshTokensModule } from '../refresh_tokens';
import { GiftsModule } from '../gifts/gifts.module';
import { ProductStoresModule } from '../product_stores';
import { UploadsModule } from '../upload/uploads.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Store]),
    BullModule.registerQueue({
      name: 'send-mail'
    }),
    StoreUsersModule,
    UsersModule,
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
