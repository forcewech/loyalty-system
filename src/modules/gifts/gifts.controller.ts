import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ERoleType } from 'src/constants';
import { Roles, UserGuard } from 'src/utils';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import { GiftsService } from './gifts.service';

@Controller('gifts')
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Post()
  @Roles(ERoleType.ADMIN, ERoleType.STORE)
  @UseGuards(UserGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() createGiftDto: any, @UploadedFile() image: Express.Multer.File) {
    return this.giftsService.create(createGiftDto, image);
  }
}
