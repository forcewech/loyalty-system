import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from 'src/database';
import { Admin } from 'src/database/entities';

@Injectable()
export class AdminRepository extends BaseRepository<Admin> {
  constructor(@InjectModel(Admin) readonly model: typeof Admin) {
    super(model);
  }
}
