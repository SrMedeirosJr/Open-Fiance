import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('deve criar um usuário', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed_password');
    jest.spyOn(userRepository, 'create').mockReturnValue({ email: 'teste@teste.com', password: 'hashed_password' } as User);
    jest.spyOn(userRepository, 'save').mockResolvedValue({ email: 'teste@teste.com' } as User);

    const result = await service.register({ email: 'teste@teste.com', password: '123456' });
    expect(result).toEqual({ message: 'Usuário criado com sucesso.' });
  });

  it('deve lançar erro ao tentar cadastrar email já existente', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue({ email: 'teste@teste.com' } as User);

    await expect(service.register({ email: 'teste@teste.com', password: '123456' })).rejects.toThrow(ConflictException);
  });

  it('deve autenticar um usuário e retornar um token', async () => {
    const mockUser = { id: 1, email: 'teste@teste.com', password: 'hashed_password' } as User;
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
    jest.spyOn(jwtService, 'sign').mockReturnValue('valid_token');

    const result = await service.login({ email: 'teste@teste.com', password: '123456' });
    expect(result).toEqual({ token: 'valid_token' });
  });

  it('deve lançar erro para credenciais inválidas', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(service.login({ email: 'teste@teste.com', password: '123456' })).rejects.toThrow(UnauthorizedException);
  });
});
