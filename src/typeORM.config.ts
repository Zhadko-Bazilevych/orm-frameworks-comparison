import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Category } from 'src/db/typeorm/category.model';
import { OrderItem } from 'src/db/typeorm/order-item.model';
import { Order } from 'src/db/typeorm/order.model';
import { Product } from 'src/db/typeorm/product.model';
import { Profile } from 'src/db/typeorm/profile.model';
import { User } from 'src/db/typeorm/user.model';
import { Comment } from 'src/db/typeorm/comment.model';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'test5_nest',
  entities: [User, Order, OrderItem, Profile, Product, Comment, Category],
  synchronize: true,
};
