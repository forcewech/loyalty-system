import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { RANK } from 'src/constants';
import { CreateRankDto } from './dto/create-rank.dto';
import { RanksService } from './ranks.service';

@Controller('ranks')
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Post()
  async create(@Body() createRankDto: CreateRankDto) {
    const data = await this.ranksService.create(createRankDto);
    return { message: RANK.CREATE_RANK_SUCCESSFULLY, data };
  }

  @Get()
  async findAll() {
    const data = await this.ranksService.findAll();
    return { message: RANK.GET_ALL_RANK_SUCCESSFULLY, data };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.ranksService.remove(id);
    return { message: RANK.DELETE_RANK_SUCCESSFULLY };
  }
}
