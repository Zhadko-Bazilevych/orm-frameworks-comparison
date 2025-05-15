import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Category } from 'src/db/typeorm/models/category.model';
import { OrderItem } from 'src/db/typeorm/models/order-item.model';
import { Comment } from 'src/db/typeorm/models/comment.model';

@Entity('Product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal' })
  price: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'last_updated',
  })
  lastUpdated: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orders: OrderItem[];

  @OneToMany(() => Comment, (comment) => comment.product)
  comments: Comment[];
}
