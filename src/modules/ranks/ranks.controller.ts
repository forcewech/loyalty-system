import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ERoleType, RANK } from 'src/constants';
import { CreateRankDto } from './dto/create-rank.dto';
import { RanksService } from './ranks.service';
import { Roles, UserGuard } from 'src/utils';
import { RolesGuard } from 'src/utils/guards/roles.guard';

@Controller('ranks')
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Post()
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async create(@Body() createRankDto: CreateRankDto) {
    const data = await this.ranksService.create(createRankDto);
    return { message: RANK.CREATE_RANK_SUCCESSFULLY, data };
  }

  @Get()
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async findAll() {
    const data = await this.ranksService.findAll();
    return { message: RANK.GET_ALL_RANK_SUCCESSFULLY, data };
  }

  @Delete(':id')
  @Roles(ERoleType.ADMIN)
  @UseGuards(UserGuard, RolesGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.ranksService.remove(id);
    return { message: RANK.DELETE_RANK_SUCCESSFULLY };
  }
}
