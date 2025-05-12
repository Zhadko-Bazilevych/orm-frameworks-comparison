import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from 'src/users/users.module';
import { OrdersModule } from 'src/orders/orders.module';
import { Comment } from 'src/db/sequelize/models/comment.model';
import { ProductsModule } from 'src/products/products.module';
import { CommentsModule } from 'src/comments/comments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { sequelizeConfig } from 'src/sequelize.config';
import { typeOrmConfig } from 'src/typeORM.config';

@Module({
  imports: [
    SequelizeModule.forRoot(sequelizeConfig),
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    OrdersModule,
    ProductsModule,
    CommentsModule,
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    // setupAssociations();
  }
}
