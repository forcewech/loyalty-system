import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { emailSender, redis } from './configs';
import { PostgresqlModule } from './database/postgresql.module';
import { AdminModule, StoresModule, UsersModule } from './modules';
import { GiftsModule } from './modules/gifts/gifts.module';
import { RanksModule } from './modules/ranks';

@Module({
  imports: [
    PostgresqlModule,
    StoresModule,
    UsersModule,
    GiftsModule,
    RanksModule,
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
