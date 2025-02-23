import { Test, TestingModule } from '@nestjs/testing';
import { UrlsService } from './urls.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShortenedUrl } from './shortened-url.entity';
import { Repository, IsNull } from 'typeorm';
import { User } from '../users/users.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('UrlsService', () => {
  let service: UrlsService;
  let urlsRepository: Repository<ShortenedUrl>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: getRepositoryToken(ShortenedUrl),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    urlsRepository = module.get<Repository<ShortenedUrl>>(getRepositoryToken(ShortenedUrl));
  });

  /*** TESTES PARA CRIAR URL ENCURTADA ***/
  it('deve encurtar uma URL com sucesso', async () => {
    jest.spyOn(service, 'generateShortCode').mockResolvedValue('abc123');
    jest.spyOn(urlsRepository, 'create').mockReturnValue({ shortCode: 'abc123', originalUrl: 'https://google.com' } as ShortenedUrl);
    jest.spyOn(urlsRepository, 'save').mockResolvedValue({ shortCode: 'abc123', originalUrl: 'https://google.com' } as ShortenedUrl);

    const result = await service.createShortenedUrl('https://google.com');
    expect(result).toEqual({ shortCode: 'abc123', originalUrl: 'https://google.com' });
  });

  it('deve lançar erro ao encurtar URL inválida', async () => {
    await expect(service.createShortenedUrl('invalid-url')).rejects.toThrow();
  });

  /*** TESTES PARA LISTAR URLs DO USUÁRIO ***/
  it('deve listar URLs do usuário', async () => {
    const user = { id: 1 } as User;
    const urls = [{ shortCode: 'abc123', originalUrl: 'https://google.com', user } as ShortenedUrl];

    jest.spyOn(urlsRepository, 'find').mockResolvedValue(urls);

    const result = await service.getUserUrls(user);
    expect(result).toEqual(urls);
  });


  /*** TESTES PARA ATUALIZAR URL ***/
  it('deve atualizar uma URL do usuário', async () => {
    const user = { id: 1 } as User;
    const url = { id: 1, shortCode: 'abc123', originalUrl: 'https://old.com', user } as ShortenedUrl;

    jest.spyOn(urlsRepository, 'findOne').mockResolvedValue(url);
    jest.spyOn(urlsRepository, 'save').mockResolvedValue({ ...url, originalUrl: 'https://new.com' });

    const result = await service.updateShortenedUrl('abc123', 'https://new.com', 1);
    expect(result).toHaveProperty('message', 'URL atualizada com sucesso.');
  });

  it('deve lançar erro ao tentar atualizar uma URL que não existe', async () => {
    jest.spyOn(urlsRepository, 'findOne').mockResolvedValue(null);

    await expect(service.updateShortenedUrl('invalid', 'https://new.com', 1)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar erro se um usuário tentar atualizar URL de outro usuário', async () => {
    const user = { id: 1 } as User;
    const otherUser = { id: 2 } as User;
    const url = { shortCode: 'abc123', originalUrl: 'https://old.com', user: otherUser } as ShortenedUrl;

    jest.spyOn(urlsRepository, 'findOne').mockResolvedValue(url);

    await expect(service.updateShortenedUrl('abc123', 'https://new.com', 1)).rejects.toThrow(ForbiddenException);
  });

  /*** TESTES PARA EXCLUIR URL ***/
  it('deve excluir uma URL do usuário', async () => {
    const user = { id: 1 } as User;
    const url = { id: 1, shortCode: 'abc123', originalUrl: 'https://google.com', user } as ShortenedUrl;

    jest.spyOn(urlsRepository, 'findOne').mockResolvedValue(url);
    jest.spyOn(urlsRepository, 'update').mockResolvedValue({ affected: 1 } as any);

    const result = await service.deleteShortenedUrl('abc123', 1);
    expect(result).toEqual({ message: 'URL excluída com sucesso.' });
  });

  it('deve lançar erro ao tentar excluir uma URL que não existe', async () => {
    jest.spyOn(urlsRepository, 'findOne').mockResolvedValue(null);

    await expect(service.deleteShortenedUrl('invalid', 1)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar erro se um usuário tentar excluir URL de outro usuário', async () => {
    const user = { id: 1 } as User;
    const otherUser = { id: 2 } as User;
    const url = { shortCode: 'abc123', originalUrl: 'https://google.com', user: otherUser } as ShortenedUrl;

    jest.spyOn(urlsRepository, 'findOne').mockResolvedValue(url);

    await expect(service.deleteShortenedUrl('abc123', 1)).rejects.toThrow(ForbiddenException);
  });
});
