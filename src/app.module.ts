import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './db/sequelize/models/user.model';
import { UsersModule } from 'src/users/users.module';
import { OrdersModule } from 'src/orders/orders.module';
import { OrderItem } from 'src/db/sequelize/models/order-item.model';
import { Order } from 'src/db/sequelize/models/order.model';
import { Product } from 'src/db/sequelize/models/product.model';
import { Category } from 'src/db/sequelize/models/category.model';
import { Profile } from 'src/db/sequelize/models/profile.model';
import { Comment } from 'src/db/sequelize/models/comment.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'test5_nest',
      models: [User, Order, OrderItem, Profile, Product, Comment, Category],
      autoLoadModels: true,
    }),
    UsersModule,
    OrdersModule,
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    // setupAssociations();
  }
}
