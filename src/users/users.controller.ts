import { Controller, Post, Body,Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ERROR_MESSAGES } from '../helpers/errors/error.messages';
import { SUCCESS_MESSAGES } from '../helpers/sucessfuls/success.messages';

@ApiTags('Usuários')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar um novo usuário' })
  @ApiResponse({ status: 201, description: SUCCESS_MESSAGES.USER_REGISTERED })
  @ApiResponse({ status: 409, description: ERROR_MESSAGES.EMAIL_IN_USE })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Autenticar um usuário' })
  @ApiResponse({ status: 200, description: SUCCESS_MESSAGES.LOGIN_SUCCESS })
  @ApiResponse({ status: 401, description: ERROR_MESSAGES.INVALID_CREDENTIALS })
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }


}
