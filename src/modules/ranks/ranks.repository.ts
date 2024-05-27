import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from 'src/database';
import { Rank } from 'src/database/entities';

@Injectable()
export class RanksRepository extends BaseRepository<Rank> {
  constructor(@InjectModel(Rank) readonly model: typeof Rank) {
    super(model);
  }
}
