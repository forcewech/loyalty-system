import { Module } from '@nestjs/common';
import { UploadsService } from './upload.service';

@Module({
  controllers: [],
  providers: [UploadsService],
  exports: [UploadsService]
})
export class UploadsModule {}
