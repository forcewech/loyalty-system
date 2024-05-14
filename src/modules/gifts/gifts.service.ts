import { Injectable } from '@nestjs/common';
import { CreateGiftDto } from './dto/create-gift.dto';
import { UpdateGiftDto } from './dto/update-gift.dto';
import { UploadsService } from '../upload';
import { GiftsRepository } from './gifts.repository';

@Injectable()
export class GiftsService {
  constructor(
    private uploadsService: UploadsService,
    private giftsRepository: GiftsRepository
  ) {}

  async create(body: CreateGiftDto, image: Express.Multer.File) {
    const payload = body;
    const imageUrl = await this.uploadsService.uploadImage(image);
    const { url } = imageUrl;
    return await this.giftsRepository.create({ ...payload, image: url });
  }

  findAll() {
    return `This action returns all gifts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gift`;
  }

  update(id: number, updateGiftDto: UpdateGiftDto) {
    return `This action updates a #${id} gift`;
  }

  remove(id: number) {
    return `This action removes a #${id} gift`;
  }
}
