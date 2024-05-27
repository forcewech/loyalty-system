import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from 'src/database';
import { RefreshToken } from 'src/database/entities';

@Injectable()
export class RefreshTokensRepository extends BaseRepository<RefreshToken> {
  constructor(@InjectModel(RefreshToken) readonly model: typeof RefreshToken) {
    super(model);
  }
}
