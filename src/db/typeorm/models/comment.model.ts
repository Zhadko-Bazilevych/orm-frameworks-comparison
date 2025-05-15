import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { User } from 'src/db/typeorm/models/user.model';
import { Product } from 'src/db/typeorm/models/product.model';

@Tree('adjacency-list')
@Entity('Comment')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true, name: 'user_id' })
  userId: number;

  @Column({ type: 'int', nullable: true, name: 'product_id' })
  productId: number;

  @Column({ type: 'int', nullable: true, name: 'parent_id' })
  parentId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp', nullable: true, name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.comments)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Comment, (comment) => comment.childComments)
  @JoinColumn({ name: 'parent_id' })
  parentComment: Comment;

  @TreeParent()
  parent: Comment;

  @TreeChildren({ cascade: true })
  childComments: Comment[];
}
