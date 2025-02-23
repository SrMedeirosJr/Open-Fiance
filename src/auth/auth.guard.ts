import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthRequest } from './auth-user.interface';
import * as jwt from 'jsonwebtoken';
import { ERROR_MESSAGES } from '../helpers/errors/error.messages';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_MISSING);
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');
      request.user = decoded as any; 
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_EXPIRED);
      }
      throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_INVALID);
    }
  }
}
