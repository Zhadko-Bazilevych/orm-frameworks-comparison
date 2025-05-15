import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Profile } from 'src/db/typeorm/models/profile.model';
import { Order } from 'src/db/typeorm/models/order.model';
import { Comment } from 'src/db/typeorm/models/comment.model';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text', name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'text', name: 'full_name' })
  fullName: string;

  @Column({ type: 'timestamp', nullable: true, name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
