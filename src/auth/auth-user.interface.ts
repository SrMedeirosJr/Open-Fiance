import { Request } from 'express';
import { User } from '../users/users.entity'

export interface AuthRequest extends Request {
  user: User;
}
