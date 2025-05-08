import { Module } from '@nestjs/common';
import { OrdersService } from 'src/orders/orders.service';
import { OrdersController } from 'src/orders/orders.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from 'src/db/sequelize/models/order.model';
import { OrdersSequelizeService } from 'src/orders/orders.sequelize.service';
import { OrderItem } from 'src/db/sequelize/models/order-item.model';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersSequelizeService],
  imports: [SequelizeModule.forFeature([Order, OrderItem])],
})
export class OrdersModule {}
