import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { ShortenedUrl } from './shortened-url.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShortenedUrl])],
  providers: [UrlsService],
  controllers: [UrlsController],
  exports: [UrlsService],
})
export class UrlsModule {}
