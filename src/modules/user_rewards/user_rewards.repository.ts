import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from 'src/database';
import { UserReward } from 'src/database/entities';

@Injectable()
export class UserRewardsRepository extends BaseRepository<UserReward> {
  constructor(@InjectModel(UserReward) readonly model: typeof UserReward) {
    super(model);
  }
}
