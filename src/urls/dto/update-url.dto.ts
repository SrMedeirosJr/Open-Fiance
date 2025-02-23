import { IsNotEmpty, IsUrl } from 'class-validator';

export class UpdateUrlDto {
  @IsUrl({}, { message: 'A nova URL é inválida' })
  @IsNotEmpty({ message: 'A nova URL não pode estar vazia' })
  newOriginalUrl: string;
}
