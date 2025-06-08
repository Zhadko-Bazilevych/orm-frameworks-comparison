import { Inject, Injectable } from '@nestjs/common';
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
import { measureTime, sumExplainTimes } from 'src/utils/utils.helpers';

@Injectable()
export class OrdersSequelizeService implements IOrdersServiceImplementation {
  constructor(
    @Inject('ORDER_MODEL_SEQUELIZE') private orderModel: typeof OrderModel,
    @Inject('PRODUCT_MODEL_SEQUELIZE')
    private productModel: typeof ProductModel,
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
        = $1`,
        {
          bind: [id],
        },
      )) as [Order[], number];

      return res[0];
    });
    return result;
  }

  async getOrderExplain(id: number) {
    const result = measureTime(async () => {
      const [explain] = await this.orderModel.sequelize!.query(
        `EXPLAIN (ANALYZE)
       SELECT "order"."id", 
              "order"."user_id" AS "userId", 
              "order"."status", 
              "order"."total_price" AS "totalPrice", 
              "order"."created_at" AS "createdAt", 
              "orderItems"."order_id" AS "orderItems.orderId", 
              "orderItems"."product_id" AS "orderItems.productId", 
              "orderItems"."quantity" AS "orderItems.quantity", 
              "orderItems"."price" AS "orderItems.price" 
       FROM "Order" AS "order" 
       LEFT OUTER JOIN "Order_item" AS "orderItems" ON "order"."id" = "orderItems"."order_id" 
       WHERE "order"."id" = $1`,
        {
          bind: [id],
        },
      );
      return explain;
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
    const sequelize = this.orderModel.sequelize!;
    const currentDate = new Date();
    const result = measureTime(async () => {
      const [[newOrder]] = (await sequelize.query(
        `INSERT INTO "Order" ("id","user_id","status","total_price","created_at") VALUES (DEFAULT,$1,$2,$3,$4) RETURNING "id","user_id","status","total_price","created_at";`,
        {
          bind: [order.userId, order.status, order.totalPrice, currentDate],
        },
      )) as [Order[], unknown];
      const orderId = newOrder.id;
      for (const orderItem of order.orderItems!) {
        await sequelize.query(
          `INSERT INTO "Order_item" ("order_id","product_id","quantity","price") VALUES ($1,$2,$3,$4) RETURNING "order_id","product_id","quantity","price";`,
          {
            bind: [
              orderId,
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

  async createOrderExplain(order: Optional<Order, 'id'>) {
    const result = await measureTime(async () => {
      const orderQueryResult = await this.orderModel.sequelize!.query(
        `EXPLAIN (ANALYZE) INSERT INTO "Order" ("id","user_id","status","total_price","created_at")
       VALUES (DEFAULT,$1,$2,$3,$4)
       RETURNING "id","user_id","status","total_price","created_at";`,
        {
          bind: [order.userId, order.status, order.totalPrice, new Date()],
        },
      );
      const orderExplain = orderQueryResult[0] as { 'QUERY PLAN': string }[];

      const [[newOrder]] = (await this.orderModel.sequelize!.query(
        `INSERT INTO "Order" ("user_id","status","total_price","created_at")
       VALUES ($1,$2,$3,$4)
       RETURNING "id","user_id","status","total_price","created_at";`,
        {
          bind: [order.userId, order.status, order.totalPrice, new Date()],
        },
      )) as [Order[], unknown];

      if (!order.orderItems || order.orderItems.length === 0) {
        return sumExplainTimes(orderExplain);
      }

      const allItemExplains: { 'QUERY PLAN': string }[][] = [];

      for (const orderItem of order.orderItems) {
        const itemQueryResult = await this.orderModel.sequelize!.query(
          `EXPLAIN (ANALYZE) INSERT INTO "Order_item" ("order_id","product_id","quantity","price")
         VALUES ($1,$2,$3,$4)
         RETURNING "order_id","product_id","quantity","price";`,
          {
            bind: [
              newOrder.id,
              orderItem.productId,
              orderItem.quantity,
              orderItem.price,
            ],
          },
        );
        const itemExplain = itemQueryResult[0] as { 'QUERY PLAN': string }[];
        allItemExplains.push(itemExplain);
      }

      return sumExplainTimes(orderExplain, ...allItemExplains);
    });

    return result;
  }

  async confirmOrderDefault(orderId: number) {
    const sequelize = this.orderModel.sequelize!;
    const result = measureTime(async () => {
      return sequelize.transaction(async (t) => {
        const order = await this.orderModel.findByPk(orderId, {
          include: [OrderItem],
          transaction: t,
          raw: false,
        });
        if (!order) {
          throw new Error('Order not found');
        }

        for (const item of order.orderItems) {
          const product = await this.productModel.findByPk(item.productId, {
            transaction: t,
          });
          if (!product) {
            throw new Error(`Product with id ${item.productId} not found`);
          }

          product.stock += item.quantity;

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
   WHERE "order"."id" = $1;`,
          {
            bind: [orderId],
            type: QueryTypes.SELECT,
            transaction: t,
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
          const productRows = await sequelize.query<ProductRaw>(
            `SELECT "id", "name", "description", "price", "stock", "category_id" AS "categoryId", "last_updated" AS "lastUpdated" 
     FROM "Product" AS "product" 
     WHERE "product"."id" = $1;`,
            { bind: [item.productId], type: QueryTypes.SELECT, transaction: t },
          );

          const product = productRows[0];

          if (!product) {
            throw new Error(`Product with id ${item.productId} not found`);
          }

          const newStock = product.stock + item.quantity;

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
            },
          );
        }

        await sequelize.query(
          `UPDATE "Order" SET "status" = $1 WHERE "id" = $2`,
          {
            bind: ['confirmed', orderId],
            transaction: t,
          },
        );

        return true;
      });
    });

    return result;
  }

  async confirmOrderExplain(orderId: number) {
    const sequelize = this.orderModel.sequelize!;

    const result = await measureTime(async () => {
      return sequelize.transaction(async (t) => {
        const ordersExplain = await sequelize.query(
          `EXPLAIN (ANALYZE)
         SELECT "order"."id", "order"."user_id" AS "userId", "order"."status", "order"."total_price" AS "totalPrice", "order"."created_at",
                "orderItems"."order_id" AS "orderItems.orderId", "orderItems"."product_id" AS "orderItems.productId",
                "orderItems"."quantity" AS "orderItems.quantity", "orderItems"."price" AS "orderItems.price"
         FROM "Order" AS "order"
         LEFT OUTER JOIN "Order_item" AS "orderItems" ON "order"."id" = "orderItems"."order_id"
         WHERE "order"."id" = $1;`,
          { bind: [orderId], transaction: t },
        );

        const orders: OrderItemRaw[] = await sequelize.query<OrderItemRaw>(
          `SELECT "order"."id", "order"."user_id" AS "userId", "order"."status", "order"."total_price" AS "totalPrice", "order"."created_at",
                "orderItems"."order_id" AS "orderItems.orderId", "orderItems"."product_id" AS "orderItems.productId",
                "orderItems"."quantity" AS "orderItems.quantity", "orderItems"."price" AS "orderItems.price"
         FROM "Order" AS "order"
         LEFT OUTER JOIN "Order_item" AS "orderItems" ON "order"."id" = "orderItems"."order_id"
         WHERE "order"."id" = $1;`,
          { bind: [orderId], type: QueryTypes.SELECT, transaction: t },
        );

        const order = orders[0];
        if (!order) throw new Error('Order not found');

        const groupedItems = new Map<
          number,
          { productId: number; quantity: number }
        >();
        for (const item of orders) {
          if (!item['orderItems.productId']) continue;
          groupedItems.set(item['orderItems.productId'], {
            productId: item['orderItems.productId'],
            quantity: item['orderItems.quantity'],
          });
        }

        const productExplains: { 'QUERY PLAN': string }[][] = [];
        const updateStockExplains: { 'QUERY PLAN': string }[][] = [];

        for (const item of groupedItems.values()) {
          const productExplain = await sequelize.query(
            `EXPLAIN (ANALYZE)
           SELECT "id", "name", "description", "price", "stock", "category_id" AS "categoryId", "last_updated" AS "lastUpdated"
           FROM "Product" AS "product"
           WHERE "product"."id" = $1;`,
            { bind: [item.productId], transaction: t },
          );
          productExplains.push(productExplain[0] as { 'QUERY PLAN': string }[]);

          const products: ProductRaw[] = await sequelize.query<ProductRaw>(
            `SELECT "id", "name", "description", "price", "stock", "category_id" AS "categoryId", "last_updated" AS "lastUpdated"
           FROM "Product" AS "product"
           WHERE "product"."id" = $1;`,
            { bind: [item.productId], type: QueryTypes.SELECT, transaction: t },
          );

          const product = products[0];
          if (!product)
            throw new Error(`Product with id ${item.productId} not found`);

          const newStock = product.stock + item.quantity;
          if (newStock < 0) {
            throw new Error(
              `Product with id ${product.id} have less than requires ${item.quantity} in stock (currently ${product.stock})`,
            );
          }

          const updateStockExplain = await sequelize.query(
            `EXPLAIN (ANALYZE) UPDATE "Product" SET "stock" = $1 WHERE "id" = $2;`,
            { bind: [newStock, item.productId], transaction: t },
          );
          updateStockExplains.push(
            updateStockExplain[0] as { 'QUERY PLAN': string }[],
          );

          await sequelize.query(
            `UPDATE "Product" SET "stock" = $1 WHERE "id" = $2;`,
            { bind: [newStock, item.productId], transaction: t },
          );
        }

        const orderStatusExplain = await sequelize.query(
          `EXPLAIN (ANALYZE) UPDATE "Order" SET "status" = $1 WHERE "id" = $2;`,
          { bind: ['confirmed', orderId], transaction: t },
        );

        await sequelize.query(
          `UPDATE "Order" SET "status" = $1 WHERE "id" = $2;`,
          { bind: ['confirmed', orderId], transaction: t },
        );

        return sumExplainTimes(
          ordersExplain[0] as { 'QUERY PLAN': string }[],
          ...productExplains,
          ...updateStockExplains,
          orderStatusExplain[0] as { 'QUERY PLAN': string }[],
        );
      });
    });

    return result;
  }
}
