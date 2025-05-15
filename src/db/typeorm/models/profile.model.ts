import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from 'src/db/typeorm/models/user.model';

@Entity('Profile')
@Unique(['userId'])
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true, name: 'user_id' })
  userId: number;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  phone: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
