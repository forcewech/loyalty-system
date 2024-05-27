import { Injectable } from '@nestjs/common';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';
import { OrderDetailsRepository } from './order_details.repository';
import { StoresRepository, UsersRepository } from 'src/modules';
import { User } from 'src/database';
import {
  ETypePoint,
  ETypeRank,
  FIXED_POINT_BRONZE,
  FIXED_POINT_GOLD,
  FIXED_POINT_SILVER,
  RATE_POINT_BRONZE,
  RATE_POINT_GOLD,
  RATE_POINT_SILVER,
  STORE
} from 'src/constants';
import { RanksRepository } from 'src/modules/ranks';
import { ErrorHelper } from 'src/utils';

@Injectable()
export class OrderDetailsService {
  constructor(
    private orderDetailsRepository: OrderDetailsRepository,
    private storesRepository: StoresRepository,
    private usersRepository: UsersRepository,
    private ranksRepository: RanksRepository
  ) {}

  async create(createOrderDetailDto: CreateOrderDetailDto, user: User): Promise<void> {
    let totalPoint = FIXED_POINT_BRONZE;
    const { totalMoney, storeId } = createOrderDetailDto;
    const storeData = await this.storesRepository.findOne({
      where: {
        id: storeId
      }
    });
    if (!storeData) {
      ErrorHelper.BadRequestException(STORE.STORE_NOT_FOUND);
    }
    const userData = await this.usersRepository.findOne({
      where: {
        id: user.id
      }
    });
    const rankData = await this.ranksRepository.findOne({
      where: {
        id: userData.rankId
      }
    });
    const rankSilver = await this.ranksRepository.findOne({
      where: {
        name: 'silver'
      }
    });
    const rankGold = await this.ranksRepository.findOne({
      where: {
        name: 'gold'
      }
    });
    if (storeData.typePoint === ETypePoint.FIXED) {
      if (rankData.name === ETypeRank.BRONZE) {
        totalPoint = (FIXED_POINT_BRONZE * totalMoney) / 100;
        createOrderDetailDto['totalPoint'] = totalPoint;
      } else if (rankData.name === ETypeRank.SILVER) {
        totalPoint = (FIXED_POINT_SILVER * totalMoney) / 100;
        createOrderDetailDto['totalPoint'] = totalPoint;
      } else {
        totalPoint = (FIXED_POINT_GOLD * totalMoney) / 100;
        createOrderDetailDto['totalPoint'] = totalPoint;
      }
    } else {
      if (rankData.name === ETypeRank.BRONZE) {
        totalPoint = Math.min((totalMoney * (totalMoney * RATE_POINT_BRONZE)) / 100, (5 * totalMoney) / 100);
        createOrderDetailDto['totalPoint'] = totalPoint;
      } else if (rankData.name === ETypeRank.SILVER) {
        totalPoint = Math.min((totalMoney * (totalMoney * RATE_POINT_SILVER)) / 100, (10 * totalMoney) / 100);
        createOrderDetailDto['totalPoint'] = totalPoint;
      } else {
        totalPoint = Math.min((totalMoney * (totalMoney * RATE_POINT_GOLD)) / 100, (20 * totalMoney) / 100);
        createOrderDetailDto['totalPoint'] = totalPoint;
      }
    }
    userData.rewardPoints += totalPoint;
    userData.reservePoints += totalPoint;
    if (userData.reservePoints >= 2000 && userData.reservePoints < 5000) {
      userData['rankId'] = rankSilver.id;
    } else if (userData.reservePoints >= 5000) {
      userData['rankId'] = rankGold.id;
    }
    await userData.save();
    await this.orderDetailsRepository.create({
      ...createOrderDetailDto,
      userId: userData.id,
      rankId: userData.rankId
    });
  }
}
