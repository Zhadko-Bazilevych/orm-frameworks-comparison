import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Optional } from 'sequelize';
import { OrderItem } from 'src/db/sequelize/models/order-item.model';
import { Order as OrderModel } from 'src/db/sequelize/models/order.model';
import { IOrdersServiceImplementation, Order } from 'src/orders/orders.types';
import { measureTime } from 'src/utils/utils.helpers';

@Injectable()
export class OrdersSequelizeService implements IOrdersServiceImplementation {
  constructor(@InjectModel(OrderModel) private orderModel: typeof OrderModel) {}

  async getOrderDefault(id: number) {
    const result = measureTime(() => {
      return this.orderModel.findByPk(id, {
        include: [
          {
            model: OrderItem,
            as: 'orderItems',
          },
        ],
        logging: console.log,
      }) as Promise<Order>;
    });
    return result;
  }

  async getOrderRaw(id: number) {
    const result = measureTime(async () => {
      const res = (await this.orderModel.sequelize!.query(
        `SELECT "order"."id", "order"."user_id" AS "userId", "order"."status", "order"."total_price" AS "totalPrice", "order"."created_at" AS "createdAt", "orderItems"."order_id" AS "orderItems.orderId", "orderItems"."product_id" AS "orderItems.productId", "orderItems"."quantity" AS "orderItems.quantity", "orderItems"."price" AS "orderItems.price" FROM "Order" AS "order" LEFT OUTER JOIN "Order_item" AS "orderItems" ON "order"."id" = "orderItems"."order_id" WHERE "order"."id" 
        = '${id}'`,
      )) as [Order[], number];

      console.log(res[0]);

      return res[0];
    });
    return result;
  }

  async createOrderDefault(order: Optional<Order, 'id'>) {
    const result = measureTime(() => {
      return this.orderModel.create(order, {
        include: [
          {
            model: OrderItem,
            as: 'orderItems',
          },
        ],
      });
    });
    return result;
  }

  async createOrderRaw(order: Optional<Order, 'id'>) {
    const result = measureTime(async () => {
      const [[newOrder]] = (await this.orderModel.sequelize!.query(
        `INSERT INTO "Order" ("id","user_id","status","total_price","created_at") VALUES (DEFAULT,$1,$2,$3,$4) RETURNING "id","user_id","status","total_price","created_at";`,
        {
          bind: [order.userId, order.status, order.totalPrice, new Date()],
        },
      )) as [Order[], unknown];
      if (!order.orderItems) return newOrder;
      for (const orderItem of order.orderItems) {
        await this.orderModel.sequelize!.query(
          `INSERT INTO "Order_item" ("order_id","product_id","quantity","price") VALUES ($1,$2,$3,$4) RETURNING "order_id","product_id","quantity","price";`,
          {
            bind: [
              orderItem.orderId,
              orderItem.productId,
              orderItem.quantity,
              orderItem.price,
            ],
          },
        );
      }
      return newOrder;
    });
    return result;
  }
}
