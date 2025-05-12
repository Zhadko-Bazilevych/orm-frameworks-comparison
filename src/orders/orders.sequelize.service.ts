import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Optional, QueryTypes } from 'sequelize';
import { OrderItem } from 'src/db/sequelize/models/order-item.model';
import { Order as OrderModel } from 'src/db/sequelize/models/order.model';
import { Product as ProductModel } from 'src/db/sequelize/models/product.model';
import {
  IOrdersServiceImplementation,
  Order,
  OrderItemRaw,
  ProductRaw,
} from 'src/orders/orders.types';
import { measureTime } from 'src/utils/utils.helpers';

@Injectable()
export class OrdersSequelizeService implements IOrdersServiceImplementation {
  constructor(
    @InjectModel(OrderModel) private orderModel: typeof OrderModel,
    @InjectModel(ProductModel) private productModel: typeof ProductModel,
  ) {}

  async getOrderDefault(id: number) {
    const result = measureTime(() => {
      return this.orderModel.findByPk(id, {
        include: [
          {
            model: OrderItem,
            as: 'orderItems',
          },
        ],
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

  async confirmOrderDefault(orderId: number) {
    const sequelize = this.orderModel.sequelize!;
    console.log('startHere', orderId);
    const result = measureTime(async () => {
      return sequelize.transaction(async (t) => {
        const order = await this.orderModel.findByPk(orderId, {
          include: [OrderItem],
          transaction: t,
          logging: console.log,
          raw: false,
        });
        console.log('ORDER: ', order);
        if (!order) {
          throw new Error('Order not found');
        }

        for (const item of order.orderItems) {
          const product = await this.productModel.findByPk(item.productId, {
            transaction: t,
            logging: console.log,
          });
          console.log('PRODUCT: ', product);
          if (!product) {
            throw new Error(`Product with id ${item.productId} not found`);
          }

          product.stock -= item.quantity;

          if (product.stock < 0) {
            throw new Error(
              `Product with id ${product.id} have less than requires ${item.quantity} in stock (currently ${product.stock})`,
            );
          }

          await product.save({ transaction: t });
        }

        order.status = 'confirmed';
        await order.save({ transaction: t });

        return true;
      });
    });

    return result;
  }

  async confirmOrderRaw(orderId: number) {
    const sequelize = this.orderModel.sequelize!;
    const result = await measureTime(async () => {
      return sequelize.transaction(async (t) => {
        const orders: OrderItemRaw[] = await sequelize.query<OrderItemRaw>(
          `SELECT "order"."id", "order"."user_id" AS "userId", "order"."status", "order"."total_price" AS "totalPrice", "order"."created_at", 
          "orderItems"."order_id" AS "orderItems.orderId", "orderItems"."product_id" AS "orderItems.productId", 
          "orderItems"."quantity" AS "orderItems.quantity", "orderItems"."price" AS "orderItems.price" 
   FROM "Order" AS "order" 
   LEFT OUTER JOIN "Order_item" AS "orderItems" ON "order"."id" = "orderItems"."order_id" 
   WHERE "order"."id" = '${orderId}';`,
          {
            type: QueryTypes.SELECT,
            transaction: t,
            logging: console.log,
          },
        );

        const order = orders[0] as OrderItemRaw | undefined;

        if (!order) {
          throw new Error('Order not found');
        }

        const groupedItems = new Map<
          number,
          { productId: number; quantity: number }
        >();
        for (const item of orders) {
          if (!item['orderItems.productId']) continue;
          const productId = item['orderItems.productId'];
          const quantity = item['orderItems.quantity'];
          groupedItems.set(productId, { productId, quantity });
        }

        for (const item of groupedItems.values()) {
          const [products] = await sequelize.query<ProductRaw>(
            `SELECT "id", "name", "description", "price", "stock", "category_id" AS "categoryId", "last_updated" AS "lastUpdated" 
           FROM "Product" AS "product" 
           WHERE "product"."id" = ${item.productId};`,
            { type: QueryTypes.SELECT, transaction: t },
          );

          const product = products[0] as ProductRaw | undefined;

          if (!product) {
            throw new Error(`Product with id ${item.productId} not found`);
          }

          const newStock = product.stock - item.quantity;

          if (newStock < 0) {
            throw new Error(
              `Product with id ${product.id} have less than requires ${item.quantity} in stock (currently ${product.stock})`,
            );
          }

          await sequelize.query(
            `UPDATE "Product" SET "stock"=$1 WHERE "id" = $2`,
            {
              bind: [newStock, item.productId],
              transaction: t,
              logging: console.log,
            },
          );
        }

        await sequelize.query(
          `UPDATE "Order" SET "status" = $1 WHERE "id" = $2`,
          {
            bind: ['confirmed', orderId],
            transaction: t,
            logging: console.log,
          },
        );

        return true;
      });
    });

    return result;
  }
}
