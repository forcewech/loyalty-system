import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from 'src/database';
import { Gift } from 'src/database/entities';

@Injectable()
export class GiftsRepository extends BaseRepository<Gift> {
  constructor(@InjectModel(Gift) readonly model: typeof Gift) {
    super(model);
  }
}
