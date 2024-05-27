import { Injectable } from '@nestjs/common';
import { RANK } from 'src/constants';
import { Rank } from 'src/database';
import { ErrorHelper } from 'src/utils';
import { CreateRankDto } from './dto/create-rank.dto';
import { RanksRepository } from './ranks.repository';

@Injectable()
export class RanksService {
  constructor(private ranksRepository: RanksRepository) {}

  async create(body: CreateRankDto): Promise<Rank> {
    const payload = body;
    const rank = await this.ranksRepository.findOne({
      where: {
        name: payload.name
      }
    });
    if (rank) {
      ErrorHelper.BadRequestException(RANK.NAME_IS_EXIST);
    }
    const data = await this.ranksRepository.create({ ...payload });
    const dataRank = data.get({ plain: true });
    delete dataRank.createdAt;
    delete dataRank.updatedAt;
    delete dataRank.deletedAt;
    return { ...dataRank };
  }

  async remove(id: number): Promise<void> {
    await this.ranksRepository.delete({
      where: {
        id
      }
    });
  }

  async findAll(): Promise<Rank[]> {
    return this.ranksRepository.find({
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    });
  }
}
