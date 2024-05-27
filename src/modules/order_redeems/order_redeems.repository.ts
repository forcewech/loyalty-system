import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from 'src/database';
import { OrderRedeem } from 'src/database/entities';

@Injectable()
export class OrderRedeemsRepository extends BaseRepository<OrderRedeem> {
  constructor(@InjectModel(OrderRedeem) readonly model: typeof OrderRedeem) {
    super(model);
  }
}
