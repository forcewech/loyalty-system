import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from 'src/database';
import { OrderRedeemDetail } from 'src/database/entities';

@Injectable()
export class OrderRedeemDetailsRepository extends BaseRepository<OrderRedeemDetail> {
  constructor(@InjectModel(OrderRedeemDetail) readonly model: typeof OrderRedeemDetail) {
    super(model);
  }
}
