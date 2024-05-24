import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserReward } from 'src/database';
import { UserRewardsRepository } from './user_rewards.repository';

@Module({
  imports: [SequelizeModule.forFeature([UserReward])],
  providers: [UserRewardsRepository],
  exports: [UserRewardsRepository]
})
export class UserRewardsModule {}
