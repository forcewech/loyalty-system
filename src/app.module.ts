import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresqlModule } from './database/postgresql.module';
import { AdminModule, StoresModule, UsersModule } from './modules';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { emailSender, redis } from './configs';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './utils/guards/roles.guard';
import { UserGuard } from './utils/guards';

@Module({
  imports: [
    PostgresqlModule,
    StoresModule,
    UsersModule,
    AdminModule,
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: emailSender.host,
          secure: false,
          auth: {
            user: emailSender.email,
            pass: emailSender.password
          }
        },
        defaults: {
          from: `"Admin" <${emailSender.from}>`
        },
        template: {
          dir: join(__dirname, '/templates/email'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        }
      })
    }),
    BullModule.forRootAsync({
      useFactory: async () => ({
        redis: {
          host: redis.host,
          port: redis.port,
          password: redis.password
        }
      })
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
