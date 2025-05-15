import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Category } from 'src/db/typeorm/models/category.model';
import { OrderItem } from 'src/db/typeorm/models/order-item.model';
import { Order } from 'src/db/typeorm/models/order.model';
import { Product } from 'src/db/typeorm/models/product.model';
import { Profile } from 'src/db/typeorm/models/profile.model';
import { User } from 'src/db/typeorm/models/user.model';
import { Comment } from 'src/db/typeorm/models/comment.model';

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
