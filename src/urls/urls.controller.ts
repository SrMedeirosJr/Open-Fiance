import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthRequest } from '../auth/auth-user.interface';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';
import { ERROR_MESSAGES } from '../helpers/errors/error.messages';
import { SUCCESS_MESSAGES } from '../helpers/sucessfuls/success.messages';

@ApiTags('URLs')
@Controller('urls')
export class UrlsController {

  private readonly logger = new Logger(UrlsController.name);
  constructor(private readonly urlsService: UrlsService) {}

  @Post()
  @ApiBearerAuth() 
  @ApiOperation({ summary: 'Criar uma URL encurtada' })
  @ApiBody({ schema: { example: { originalUrl: 'https://www.exemplo.com' } } })
  @ApiResponse({ status: 201, description: SUCCESS_MESSAGES.URL_CREATED })
  @ApiResponse({ status: 401, description: ERROR_MESSAGES.UNAUTHORIZED })
  async createShortUrl(
    @Body('originalUrl') originalUrl: string,
    @Req() request: AuthRequest
  ) {
    let user = undefined; 
    const authHeader = request.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey') as any;
        user = { id: decoded.id } as any; 
      } catch (error) {
        throw new Error(ERROR_MESSAGES.TOKEN_INVALID);
      }
    }

    
    return await this.urlsService.createShortenedUrl(originalUrl, user);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar URLs do usuário autenticado' })
  @ApiResponse({ status: 200, description: SUCCESS_MESSAGES.URLS_FETCHED })
  @ApiResponse({ status: 401, description: ERROR_MESSAGES.UNAUTHORIZED })
  async getUserUrls(@Req() request: AuthRequest) {
    return await this.urlsService.getUserUrls(request.user);
  }

  @Get(':shortCode')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Redirecionar para a URL original' })
  @ApiResponse({ status: 302, description: SUCCESS_MESSAGES.URL_FOUND })
  @ApiResponse({ status: 404, description: ERROR_MESSAGES.URL_NOT_FOUND })
  async getOriginalUrl(@Param('shortCode') shortCode: string) {
    const url = await this.urlsService.findByShortCode(shortCode);

    if (!url) {
      throw new Error(ERROR_MESSAGES.URL_NOT_FOUND);
    }

    return {
      originalUrl: url.originalUrl,
      shortCode: shortCode,
      clickCount: url.clickCount,
    };
}  
 
 @Put(':shortCode')
 @UseGuards(AuthGuard)
 @ApiBearerAuth()
 @ApiOperation({ summary: 'Atualizar a URL original de um código encurtado' })
 @ApiBody({ schema: { example: { originalUrl: 'https://www.exemplo.com' } } })
 @ApiResponse({ status: 200, description: SUCCESS_MESSAGES.URL_UPDATED })
 @ApiResponse({ status: 403, description: ERROR_MESSAGES.NO_PERMISSION })
 @ApiResponse({ status: 404, description: ERROR_MESSAGES.URL_NOT_FOUND })
 async updateShortenedUrl(
   @Param('shortCode') shortCode: string,
   @Body('originalUrl') newOriginalUrl: string,
   @Req() request: AuthRequest
 ) {
   const user = request.user;
   if (!user) {
     throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
   }

   return await this.urlsService.updateShortenedUrl(shortCode, newOriginalUrl, user.id);
 }

@Delete(':shortCode')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Excluir uma URL encurtada' })
@ApiResponse({ status: 200, description: SUCCESS_MESSAGES.URL_DELETED })
  @ApiResponse({ status: 403, description: ERROR_MESSAGES.NO_PERMISSION })
  @ApiResponse({ status: 404, description: ERROR_MESSAGES.URL_NOT_FOUND })
async deleteShortenedUrl(
  @Param('shortCode') shortCode: string,
  @Req() request: AuthRequest
) {
  const user = request.user;
  if (!user) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  return await this.urlsService.deleteShortenedUrl(shortCode, user.id);
}
}
