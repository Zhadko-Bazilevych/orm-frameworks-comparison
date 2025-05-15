import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/db/typeorm/models/user.model';
import { OrderItem } from 'src/db/typeorm/models/order-item.model';

@Entity('Order')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: [
      'processing',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
      'returned',
    ],
    default: 'processing',
  })
  status: string;

  @Column({ type: 'decimal', name: 'total_price' })
  totalPrice: string;

  @Column({ type: 'timestamp', nullable: true, name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems: OrderItem[];
}
