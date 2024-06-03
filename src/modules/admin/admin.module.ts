import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from 'src/database';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import { RefreshTokensModule } from '../refresh_tokens';
import { RanksModule } from '../ranks';
import { UsersModule } from '../users';
import { StoreUsersModule } from '../store_users';
import { StoresModule } from '../stores';

@Module({
  imports: [
    SequelizeModule.forFeature([Admin]),
    RefreshTokensModule,
    RanksModule,
    UsersModule,
    StoreUsersModule,
    StoresModule
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository]
})
export class AdminModule {}
