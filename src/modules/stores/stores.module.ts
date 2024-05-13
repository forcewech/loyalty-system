import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Store } from 'src/database';
import { EmailConsumer } from './consumers/email.consumer';
import { StoresController } from './stores.controller';
import { StoresRepository } from './stores.repository';
import { StoresService } from './stores.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Store]),
    BullModule.registerQueue({
      name: 'send-mail'
    })
  ],
  controllers: [StoresController],
  providers: [StoresService, StoresRepository, EmailConsumer]
})
export class StoresModule {}
