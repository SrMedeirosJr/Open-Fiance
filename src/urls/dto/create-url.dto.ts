import { IsNotEmpty, IsUrl} from 'class-validator';

export class CreateUrlDto {
  @IsUrl({}, { message: 'URL inválida' })
  @IsNotEmpty({ message: 'A URL original é obrigatória' })
  originalUrl: string;
}
