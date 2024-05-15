import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from 'src/database';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersRepository } from './users.repository';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository]
})
export class UsersModule {}
