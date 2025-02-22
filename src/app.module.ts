import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { UrlsModule } from './urls/urls.module';
import { User } from './users/users.entity';
import { ShortenedUrl } from './urls/shortened-url.entity';

ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env', // Garante que o NestJS leia o .env corretamente
});


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'url_shortener',
      entities: [User, ShortenedUrl],
      synchronize: false,
    }),
    UsersModule,
    UrlsModule,
  ],
})
export class AppModule {}

