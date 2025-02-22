import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthRequest } from '../auth/auth-user.interface';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';

@ApiTags('URLs')
@Controller('urls')
export class UrlsController {

  private readonly logger = new Logger(UrlsController.name);
  constructor(private readonly urlsService: UrlsService) {}

  @Post()
  @ApiBearerAuth() // Indica que a requisição precisa de autenticação JWT
  @ApiOperation({ summary: 'Criar uma URL encurtada' })
  @ApiResponse({ status: 201, description: 'URL encurtada com sucesso' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  async createShortUrl(
    @Body('originalUrl') originalUrl: string,
    @Req() request: AuthRequest
  ) {
    let user = undefined; // 🔥 Por padrão, assume que não há usuário autenticado

    // 🔥 Verifica se há token no cabeçalho
    const authHeader = request.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey') as any;
        user = { id: decoded.id } as any; // 🔥 Pega apenas o ID do usuário autenticado
      } catch (error) {
        throw new NotFoundException('Token inválido ou expirado');
      }
    }

    // 🔥 Cria a URL encurtada, associando o usuário apenas se estiver autenticado
    return await this.urlsService.createShortenedUrl(originalUrl, user);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar URLs do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de URLs do usuário autenticado' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  async getUserUrls(@Req() request: AuthRequest) {
    return await this.urlsService.getUserUrls(request.user);
  }

  @Get(':shortCode')
  @ApiOperation({ summary: 'Redirecionar para a URL original' })
  @ApiResponse({ status: 302, description: 'Redirecionamento bem-sucedido' })
  @ApiResponse({ status: 404, description: 'URL não encontrada' })
  async getOriginalUrl(@Param('shortCode') shortCode: string) {
    const url = await this.urlsService.findByShortCode(shortCode);

    if (!url) {
      throw new NotFoundException('URL não encontrada');
    }

    return {
      originalUrl: url.originalUrl,
      shortCode: shortCode,
      clickCount: url.clickCount,
    };
}  
 // 🔥 Endpoint para atualizar a URL original
 @Put(':shortCode')
 @UseGuards(AuthGuard)
 @ApiBearerAuth()
 @ApiOperation({ summary: 'Atualizar a URL original de um código encurtado' })
 @ApiResponse({ status: 200, description: 'URL atualizada com sucesso' })
 @ApiResponse({ status: 403, description: 'Usuário não autorizado a editar esta URL' })
 @ApiResponse({ status: 404, description: 'URL não encontrada' })
 async updateShortenedUrl(
   @Param('shortCode') shortCode: string,
   @Body('originalUrl') newOriginalUrl: string,
   @Req() request: AuthRequest
 ) {
   const user = request.user;
   if (!user) {
     throw new ForbiddenException('Usuário não autenticado.');
   }

   return await this.urlsService.updateShortenedUrl(shortCode, newOriginalUrl, user.id);
 }

 @Delete(':shortCode')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Excluir uma URL encurtada' })
@ApiResponse({ status: 200, description: 'URL excluída com sucesso' })
@ApiResponse({ status: 403, description: 'Usuário não autorizado a excluir esta URL' })
@ApiResponse({ status: 404, description: 'URL não encontrada' })
async deleteShortenedUrl(
  @Param('shortCode') shortCode: string,
  @Req() request: AuthRequest
) {
  const user = request.user;
  if (!user) {
    throw new ForbiddenException('Usuário não autenticado.');
  }

  return await this.urlsService.deleteShortenedUrl(shortCode, user.id);
}
}
