import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { User } from 'src/db/sequelize/models/user.model';
import { OrderItem } from 'src/db/sequelize/models/order-item.model';
import { Order } from 'src/db/sequelize/models/order.model';
import { Product } from 'src/db/sequelize/models/product.model';
import { Category } from 'src/db/sequelize/models/category.model';
import { Profile } from 'src/db/sequelize/models/profile.model';
import { Comment } from 'src/db/sequelize/models/comment.model';

export const sequelizeConfig: SequelizeModuleOptions = {
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'test5_nest',
  models: [User, Order, OrderItem, Profile, Product, Comment, Category],
  autoLoadModels: false,
};
