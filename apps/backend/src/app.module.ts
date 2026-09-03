// Load .env before any module registration: DatabaseModule.register()
// reads process.env.DATABASE_URL at import time (class decorator
// evaluation), which happens before ConfigModule would load the file.
import 'dotenv/config';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
