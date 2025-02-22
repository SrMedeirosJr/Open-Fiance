import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ShortenedUrl } from './shortened-url.entity';
import { User } from '../users/users.entity';
import * as crypto from 'crypto';
import { ERROR_MESSAGES } from '../helpers/errors/error.messages';
import { SUCCESS_MESSAGES } from '../helpers/sucessfuls/success.messages';

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(ShortenedUrl)
    private urlsRepository: Repository<ShortenedUrl>,
  ) {}

  async generateShortCode(): Promise<string> {
    let shortCode: string;
    let exists: ShortenedUrl | null;

    do {
      shortCode = crypto.randomBytes(3).toString('base64').replace(/\W/g, '');
      exists = await this.urlsRepository.findOne({ where: { shortCode } });
    } while (exists);

    return shortCode;
  }

  async createShortenedUrl(originalUrl: string, user?: User): Promise<ShortenedUrl> {
    if (!originalUrl) {
      throw new BadRequestException(ERROR_MESSAGES.MISSING_URL);
    }

    const shortCode = await this.generateShortCode();

    const newUrlData: Partial<ShortenedUrl> = {
      shortCode,
      originalUrl,
      user: user ?? undefined,
    };

    const newUrl = this.urlsRepository.create(newUrlData);
    const savedUrl = await this.urlsRepository.save(newUrl);

    return savedUrl;
  }

  async findByShortCode(shortCode: string): Promise<ShortenedUrl> {
    const url = await this.urlsRepository.findOne({
      where: { shortCode },
      relations: ['user'],
    });

    if (!url) {
      throw new NotFoundException(ERROR_MESSAGES.URL_NOT_FOUND);
    }

    return url;
  }

  async incrementClickCount(shortCode: string): Promise<void> {
    const url = await this.findByShortCode(shortCode);
    if (!url) {
      throw new NotFoundException(ERROR_MESSAGES.URL_NOT_FOUND);
    }
    await this.urlsRepository.increment({ shortCode }, 'clickCount', 1);
  }

  async getUserUrls(user: User): Promise<ShortenedUrl[]> {
    const urls = await this.urlsRepository.find({
      where: { user: { id: user.id }, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    if (urls.length === 0) {
      throw new NotFoundException(ERROR_MESSAGES.NO_URLS_FOUND);
    }

    return urls;
  }

  async updateShortenedUrl(shortCode: string, newOriginalUrl: string, userId: number): Promise<{ message: string }> {
    const url = await this.urlsRepository.findOne({ where: { shortCode }, relations: ['user'] });

    if (!url) {
      throw new NotFoundException(ERROR_MESSAGES.URL_NOT_FOUND);
    }

    if (!url.user || url.user.id !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.UNAUTHORIZED_URL_ACCESS);
    }

    url.originalUrl = newOriginalUrl;
    await this.urlsRepository.save(url);

    return { message: SUCCESS_MESSAGES.URL_UPDATED };
  }

  async deleteShortenedUrl(shortCode: string, userId: number): Promise<{ message: string }> {
    const url = await this.urlsRepository.findOne({ where: { shortCode }, relations: ['user'] });

    if (!url) {
      throw new NotFoundException(ERROR_MESSAGES.URL_NOT_FOUND);
    }

    if (!url.user || url.user.id !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.UNAUTHORIZED_URL_ACCESS);
    }

    await this.urlsRepository.update(url.id, { deletedAt: new Date() });

    return { message: SUCCESS_MESSAGES.URL_DELETED };
  }
}
