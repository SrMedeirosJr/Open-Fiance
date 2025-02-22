import { Injectable, ConflictException, UnauthorizedException, BadRequestException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ERROR_MESSAGES } from '../helpers/errors/error.messages';
import { SUCCESS_MESSAGES } from '../helpers/sucessfuls/success.messages';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const { email, password } = createUserDto;
    
    if (!email) {
      throw new BadRequestException(ERROR_MESSAGES.MISSING_EMAIL);
    }
    if (!password) {
      throw new BadRequestException(ERROR_MESSAGES.MISSING_PASSWORD);
    }

    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException(ERROR_MESSAGES.EMAIL_IN_USE);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ email, password: hashedPassword });
    await this.usersRepository.save(user);

    return { message: SUCCESS_MESSAGES.USER_CREATED };
  }

  async login(loginUserDto: LoginUserDto): Promise<{ token: string }> {
    const { email, password } = loginUserDto;

    if (!email) {
      throw new BadRequestException(ERROR_MESSAGES.MISSING_EMAIL);
    }
    if (!password) {
      throw new BadRequestException(ERROR_MESSAGES.MISSING_PASSWORD);
    }

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const token = this.jwtService.sign({ id: user.id, email: user.email });
    return { token };
  }
}