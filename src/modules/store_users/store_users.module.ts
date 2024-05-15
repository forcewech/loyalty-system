import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StoreUser } from 'src/database';
import { StoreUsersRepository } from './store_users.repository';

@Module({
  imports: [SequelizeModule.forFeature([StoreUser])],
  providers: [StoreUsersRepository],
  exports: [StoreUsersRepository]
})
export class StoreUsersModule {}
