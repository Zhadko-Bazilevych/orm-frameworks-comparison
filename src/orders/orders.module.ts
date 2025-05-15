import { Module } from '@nestjs/common';
import { OrdersService } from 'src/orders/orders.service';
import { OrdersController } from 'src/orders/orders.controller';
import { Order as SequelizeOrderModel } from 'src/db/sequelize/models/order.model';
import { Order as TypeOrmOrderModel } from 'src/db/typeorm/models/order.model';
import { Product as SequelizeProductModel } from 'src/db/sequelize/models/product.model';
import { Product as TypeOrmProductModel } from 'src/db/typeorm/models/product.model';
import { OrdersSequelizeService } from 'src/orders/orders.sequelize.service';
import { DataSource } from 'typeorm';
import { OrdersTypeOrmService } from 'src/orders/orders.typeorm.service';

@Module({
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrdersSequelizeService,
    OrdersTypeOrmService,
    {
      provide: 'ORDER_REPOSITORY_TYPEORM',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(TypeOrmOrderModel),
      inject: [DataSource],
    },
    {
      provide: 'ORDER_MODEL_SEQUELIZE',
      useValue: SequelizeOrderModel,
    },
    {
      provide: 'PRODUCT_REPOSITORY_TYPEORM',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(TypeOrmProductModel),
      inject: [DataSource],
    },
    {
      provide: 'PRODUCT_MODEL_SEQUELIZE',
      useValue: SequelizeProductModel,
    },
  ],
})
export class OrdersModule {}
