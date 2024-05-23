import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from 'src/database';
import { OrderDetail } from 'src/database/entities';

@Injectable()
export class OrderDetailsRepository extends BaseRepository<OrderDetail> {
  constructor(@InjectModel(OrderDetail) readonly model: typeof OrderDetail) {
    super(model);
  }
}
