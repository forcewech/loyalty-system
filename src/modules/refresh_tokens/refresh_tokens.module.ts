import { Module } from '@nestjs/common';
import { RefreshTokensRepository } from './refresh_tokens.repository';
import { RefreshToken } from 'src/database';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([RefreshToken])],
  providers: [RefreshTokensRepository],
  exports: [RefreshTokensRepository]
})
export class RefreshTokensModule {}
