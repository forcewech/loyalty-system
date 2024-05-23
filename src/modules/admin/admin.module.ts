import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from 'src/database';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import { RefreshTokensModule } from '../refresh_tokens';

@Module({
  imports: [SequelizeModule.forFeature([Admin]), RefreshTokensModule],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository]
})
export class AdminModule {}
