import { Injectable, NotFoundException, ForbiddenException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull  } from 'typeorm';
import { ShortenedUrl } from './shortened-url.entity';
import { User } from '../users/users.entity';
import * as crypto from 'crypto';

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
  

  async findByShortCode(shortCode: string): Promise<ShortenedUrl | null> {
    return await this.urlsRepository.findOne({
      where: { shortCode },
      relations: ['user'], 
    });
  }

  async incrementClickCount(shortCode: string): Promise<void> {
    const url = await this.findByShortCode(shortCode);
    if (!url) {
      throw new NotFoundException('URL não encontrada');
    }
    await this.urlsRepository.increment({ shortCode }, 'clickCount', 1);
  }

  async getUserUrls(user: User): Promise<ShortenedUrl[]> {
 
    const urls = await this.urlsRepository.find({
      where: { user: { id: user.id }, deletedAt: IsNull(), }, 
      order: { createdAt: 'DESC' }, 
      relations: ['user'], 
    });
  
    return urls;
  }

  async updateShortenedUrl(shortCode: string, newOriginalUrl: string, userId: number): Promise<ShortenedUrl> {
    const url = await this.urlsRepository.findOne({ where: { shortCode }, relations: ['user'] });

    if (!url) {
      throw new NotFoundException('URL não encontrada.');
    }

    if (!url.user || url.user.id !== userId) {
      throw new ForbiddenException('Usuário não tem permissão para editar esta URL.');
    }

    url.originalUrl = newOriginalUrl;
    return await this.urlsRepository.save(url);
  }

  async deleteShortenedUrl(shortCode: string, userId: number): Promise<{ message: string }> {
    const url = await this.urlsRepository.findOne({ where: { shortCode }, relations: ['user'] });
  
    if (!url) {
      throw new NotFoundException('URL não encontrada.');
    }
  
    if (!url.user || url.user.id !== userId) {
      throw new ForbiddenException('Usuário não tem permissão para excluir esta URL.');
    }
  
    // 🔥 Exclusão lógica: em vez de deletar, apenas marcamos como excluída
    await this.urlsRepository.update(url.id, { deletedAt: new Date() });
  
    return { message: 'URL excluída com sucesso.' };
  }
  
}
