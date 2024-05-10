import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from 'src/database';
import { User } from 'src/database/entities';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(@InjectModel(User) readonly model: typeof User) {
    super(model);
  }
}
