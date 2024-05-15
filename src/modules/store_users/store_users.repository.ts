import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from 'src/database';
import { StoreUser } from 'src/database/entities';

@Injectable()
export class StoreUsersRepository extends BaseRepository<StoreUser> {
  constructor(@InjectModel(StoreUser) readonly model: typeof StoreUser) {
    super(model);
  }
}
