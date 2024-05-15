import { Injectable } from '@nestjs/common';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { RanksRepository } from './ranks.repository';

@Injectable()
export class RanksService {
  constructor(private ranksRepository: RanksRepository) {}

  create(body: CreateRankDto) {
    const payload = body;
    return this.ranksRepository.create({ ...payload });
  }

  findAll() {
    return `This action returns all ranks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rank`;
  }

  update(id: number, updateRankDto: UpdateRankDto) {
    return `This action updates a #${id} rank`;
  }

  remove(id: number) {
    return `This action removes a #${id} rank`;
  }
}
