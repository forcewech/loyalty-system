import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin } from 'src/database';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminRepository } from './admin.repository';

@Module({
  imports: [SequelizeModule.forFeature([Admin])],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository]
})
export class AdminModule {}
