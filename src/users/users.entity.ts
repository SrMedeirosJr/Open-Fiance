import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ShortenedUrl } from '../urls/shortened-url.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'hashedpassword', description: 'Senha do usuário (armazenada de forma segura)' })
  @Column()
  password: string;

  @OneToMany(() => ShortenedUrl, (url) => url.user)
  urls: ShortenedUrl[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
