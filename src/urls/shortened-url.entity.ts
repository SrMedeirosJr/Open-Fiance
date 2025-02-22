import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';

@Entity('shortened_urls')
export class ShortenedUrl {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  shortCode: string;

  @Column()
  originalUrl: string;

  @Column({ default: 0 })
  clickCount: number;

  @ManyToOne(() => User, (user) => user.urls, { nullable: true, onDelete: 'CASCADE' })
  user?: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  deletedAt: Date; // 🔥 Adiciona a exclusão lógica
}
