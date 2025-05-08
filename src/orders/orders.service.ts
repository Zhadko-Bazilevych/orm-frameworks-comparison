import { Inject } from '@nestjs/common';
import { BaseService } from 'src/utils/utils.service';
import { IOrdersService } from 'src/orders/orders.types';
import { OrdersSequelizeService } from 'src/orders/orders.sequelize.service';
import { InterfaceToType } from 'src/utils/utils.types';

export class OrdersService extends BaseService<
  InterfaceToType<IOrdersService>
> {
  constructor(
    @Inject(OrdersSequelizeService)
    ordersSequelizeService: OrdersSequelizeService,
    // @Inject(OrderTypeOrmService)
    // orderTypeOrmService: OrderTypeOrmService,
  ) {
    super(ordersSequelizeService);
  }
}
