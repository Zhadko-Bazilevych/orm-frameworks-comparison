import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from 'src/db/typeorm/models/order.model';
import { Product } from 'src/db/typeorm/models/product.model';

@Entity('Order_item')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'order_id' })
  orderId: number;

  @Column({ type: 'int', name: 'product_id' })
  productId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal' })
  price: string;

  @ManyToOne(() => Order, (order) => order.orderItems)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orders)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
