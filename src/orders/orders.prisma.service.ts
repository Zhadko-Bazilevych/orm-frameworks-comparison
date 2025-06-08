import { Injectable } from '@nestjs/common';
import { OrderItem, OrderStatusEnum, Product } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { IOrdersServiceImplementation, Order } from 'src/orders/orders.types';
import { measureTime, sumExplainTimes } from 'src/utils/utils.helpers';

@Injectable()
export class OrdersPrismaService implements IOrdersServiceImplementation {
  constructor(private prisma: PrismaService) {}

  async getOrderDefault(id: number) {
    const result = await measureTime(() => {
      return this.prisma.order.findUnique({
        where: { id: Number(id) },
        include: {
          orderItems: true,
        },
      });
    });

    return result;
  }

  async getOrderRaw(id: number, offset = 0) {
    const orderId = Number(id);

    const result = await measureTime(async () => {
      const orders = await this.prisma.$queryRaw<Record<string, any>[]>`
      SELECT
        "id",
        "user_id",
        "status"::text,
        "total_price",
        "created_at"
      FROM "public"."Order"
      WHERE "id" = ${orderId} AND 1=1
      LIMIT 1 OFFSET 0
    `;

      if (orders.length === 0) {
        throw new Error('Order not found');
      }
      const order = orders[0];

      const orderItems = await this.prisma.$queryRaw<
        {
          id: number;
          order_id: number;
          product_id: number;
          quantity: number;
          price: number;
        }[]
      >`
      SELECT
        "id",
        "order_id",
        "product_id",
        "quantity",
        "price"
      FROM "public"."Order_item"
      WHERE "order_id" IN (${orderId})
      OFFSET ${offset}
    `;

      return {
        ...order,
        orderItems,
      };
    });

    return result;
  }

  async getOrderExplain(id: number, offset = 0) {
    const orderId = Number(id);

    const result = await measureTime(async () => {
      const orderExplain = await this.prisma.$queryRaw<
        { 'QUERY PLAN': string }[]
      >`
      EXPLAIN (ANALYZE)
      SELECT
        "id",
        "user_id",
        "status"::text,
        "total_price",
        "created_at"
      FROM "public"."Order"
      WHERE "id" = ${orderId}
      LIMIT 1 OFFSET 0
    `;

      const orderItemsExplain = await this.prisma.$queryRaw<
        { 'QUERY PLAN': string }[]
      >`
      EXPLAIN (ANALYZE)
      SELECT
        "id",
        "order_id",
        "product_id",
        "quantity",
        "price"
      FROM "public"."Order_item"
      WHERE "order_id" IN (${orderId})
      OFFSET ${offset}
    `;

      return sumExplainTimes(orderExplain, orderItemsExplain);
    });

    return result;
  }

  async createOrderDefault(order: Order) {
    const orderData = {
      ...order,
      orderItems: {
        create: order.orderItems,
      },
      status: order.status as OrderStatusEnum,
    };
    const result = await measureTime(() => {
      return this.prisma.order.create({
        data: orderData,
        include: {
          orderItems: true,
        },
      });
    });

    return result;
  }

  async createOrderRaw(order: Order) {
    const result = await measureTime(async () => {
      const [newOrder] = await this.prisma.$queryRaw<
        { id: number }[]
      >`INSERT INTO "public"."Order" ("user_id","status","total_price")
      VALUES (${order.userId}, CAST(${order.status}::text AS "public"."Order_status_enum"), ${order.totalPrice})
      RETURNING "id"`;

      if (!order.orderItems?.length) {
        const [orderOnly] = await this.prisma.$queryRaw<Order[]>`
        SELECT "id", "user_id", "status"::text, "total_price", "created_at"
        FROM "public"."Order"
        WHERE "id" = ${newOrder.id} LIMIT 1 OFFSET 0`;
        return orderOnly;
      }

      const values: string[] = [];
      const params: number[] = [];
      let idx = 1;

      for (const item of order.orderItems) {
        values.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++})`);
        params.push(newOrder.id, item.productId, item.quantity, item.price);
      }

      await this.prisma.$queryRawUnsafe(
        `INSERT INTO "public"."Order_item" ("order_id","product_id","quantity","price") VALUES ${values.join(', ')}`,
        ...params,
      );

      const [createdOrder] = await this.prisma.$queryRaw<Order[]>`
      SELECT "id", "user_id", "status"::text, "total_price", "created_at"
      FROM "public"."Order"
      WHERE "id" = ${newOrder.id} LIMIT 1 OFFSET 0`;

      const orderItems = await this.prisma.$queryRaw<OrderItem[]>`
      SELECT "id", "order_id", "product_id", "quantity", "price"
      FROM "public"."Order_item"
      WHERE "order_id" IN (${newOrder.id}) OFFSET 0`;

      return { ...createdOrder, orderItems };
    });

    return result;
  }

  async createOrderExplain(order: Order) {
    return measureTime(async () => {
      const insertOrderExplain = await this.prisma.$queryRaw<
        { 'QUERY PLAN': string }[]
      >`EXPLAIN (ANALYZE, VERBOSE, FORMAT TEXT)
    INSERT INTO "public"."Order" ("user_id","status","total_price")
    VALUES (${order.userId}, CAST(${order.status}::text AS "public"."Order_status_enum"), ${order.totalPrice})
    RETURNING "id"`;

      const [newOrder] = await this.prisma.$queryRaw<{ id: number }[]>`
    INSERT INTO "public"."Order" ("user_id","status","total_price")
    VALUES (${order.userId}, CAST(${order.status}::text AS "public"."Order_status_enum"), ${order.totalPrice})
    RETURNING "id"`;

      if (!order.orderItems?.length) {
        const selectOrderExplain = await this.prisma.$queryRaw<
          { 'QUERY PLAN': string }[]
        >`EXPLAIN (ANALYZE, VERBOSE, FORMAT TEXT)
      SELECT "id", "user_id", "status"::text, "total_price", "created_at"
      FROM "public"."Order"
      WHERE "id" = ${newOrder.id} LIMIT 1 OFFSET 0`;

        return sumExplainTimes(insertOrderExplain, selectOrderExplain);
      }

      const values: string[] = [];
      const params: number[] = [];
      let idx = 1;

      for (const item of order.orderItems) {
        values.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++})`);
        params.push(newOrder.id, item.productId, item.quantity, item.price);
      }

      const insertOrderItemsExplain = (await this.prisma.$queryRawUnsafe(
        `EXPLAIN (ANALYZE, VERBOSE, FORMAT TEXT)
     INSERT INTO "public"."Order_item" ("order_id","product_id","quantity","price") VALUES ${values.join(', ')}`,
        ...params,
      )) as { 'QUERY PLAN': string }[];

      const selectOrderExplain = await this.prisma.$queryRaw<
        { 'QUERY PLAN': string }[]
      >`EXPLAIN (ANALYZE, VERBOSE, FORMAT TEXT)
    SELECT "id", "user_id", "status"::text, "total_price", "created_at"
    FROM "public"."Order"
    WHERE "id" = ${newOrder.id} LIMIT 1 OFFSET 0`;

      const selectOrderItemsExplain = await this.prisma.$queryRaw<
        { 'QUERY PLAN': string }[]
      >`EXPLAIN (ANALYZE, VERBOSE, FORMAT TEXT)
    SELECT "id", "order_id", "product_id", "quantity", "price"
    FROM "public"."Order_item"
    WHERE "order_id" IN (${newOrder.id}) OFFSET 0`;

      return sumExplainTimes(
        insertOrderExplain,
        insertOrderItemsExplain,
        selectOrderExplain,
        selectOrderItemsExplain,
      );
    });
  }

  async confirmOrderDefault(orderId: number) {
    const result = await measureTime(async () => {
      return this.prisma.$transaction(async (prisma) => {
        const order = await prisma.order.findUnique({
          where: { id: Number(orderId) },
          include: { orderItems: true },
        });

        if (!order) {
          throw new Error('Order not found');
        }

        for (const item of order.orderItems) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Product with id ${item.productId} not found`);
          }

          const newStock = product.stock + item.quantity;

          if (newStock < 0) {
            throw new Error(
              `Product with id ${product.id} has less stock (${product.stock}) than required (${item.quantity})`,
            );
          }

          await prisma.product.update({
            where: { id: product.id },
            data: { stock: newStock },
          });
        }

        await prisma.order.update({
          where: { id: Number(orderId) },
          data: { status: 'confirmed' as OrderStatusEnum },
        });

        return true;
      });
    });

    return result;
  }

  async confirmOrderRaw(orderId: number) {
    const result = await measureTime(async () => {
      await this.prisma.$executeRaw`BEGIN`;

      try {
        const [order] = await this.prisma.$queryRaw<Order[]>`
        SELECT "id", "user_id", "status"::text, "total_price", "created_at"
        FROM "public"."Order"
        WHERE ("id" = ${Number(orderId)} AND 1=1)
        LIMIT 1 OFFSET 0`;

        if (!order) {
          throw new Error('Order not found');
        }

        const orderItems = await this.prisma.$queryRaw<
          { product_id: number; quantity: number }[]
        >`
        SELECT "id", "order_id", "product_id", "quantity", "price"
        FROM "public"."Order_item"
        WHERE "order_id" IN (${order.id}) OFFSET 0`;

        for (const item of orderItems) {
          const [product] = await this.prisma.$queryRaw<Product[]>`
          SELECT "id", "name", "description", "price", "stock", "last_updated", "category_id"
          FROM "public"."Product"
          WHERE ("id" = ${item.product_id} AND 1=1)
          LIMIT 1 OFFSET 0`;

          if (!product) {
            throw new Error(`Product with id ${item.product_id} not found`);
          }

          const newStock = product.stock + item.quantity;

          if (newStock < 0) {
            throw new Error(
              `Product with id ${product.id} has less stock (${product.stock}) than required (${item.quantity})`,
            );
          }

          await this.prisma.$queryRaw<Product[]>`
          UPDATE "public"."Product"
          SET "stock" = ${newStock}
          WHERE ("id" = ${product.id} AND 1=1)
          RETURNING "id", "name", "description", "price", "stock", "last_updated", "category_id"`;
        }

        await this.prisma.$queryRaw<Order[]>`
        UPDATE "public"."Order"
        SET "status" = CAST('confirmed'::text AS "public"."Order_status_enum")
        WHERE ("id" = ${Number(orderId)} AND 1=1)
        RETURNING "id", "user_id", "status"::text, "total_price", "created_at"`;

        await this.prisma.$executeRaw`COMMIT`;

        return true;
      } catch (error) {
        await this.prisma.$executeRaw`ROLLBACK`;
        throw error;
      }
    });

    return result;
  }

  async confirmOrderExplain(orderId: number) {
    return measureTime(async () => {
      const explains: { 'QUERY PLAN': string }[][] = [];

      // EXPLAIN order SELECT
      const orderExplain = (await this.prisma.$queryRawUnsafe(
        `EXPLAIN (ANALYZE)
       SELECT "id", "user_id", "status"::text, "total_price", "created_at"
       FROM "public"."Order"
       WHERE ("id" = $1 AND 1=1)
       LIMIT 1 OFFSET 0`,
        Number(orderId),
      )) as { 'QUERY PLAN': string }[];
      explains.push(orderExplain);

      const [order] = (await this.prisma.$queryRawUnsafe(
        `SELECT "id", "user_id", "status"::text, "total_price", "created_at"
       FROM "public"."Order"
       WHERE ("id" = $1 AND 1=1)
       LIMIT 1 OFFSET 0`,
        Number(orderId),
      )) as Order[];

      if (!order) {
        throw new Error('Order not found');
      }

      // EXPLAIN order items SELECT
      const orderItemsExplain = (await this.prisma.$queryRawUnsafe(
        `EXPLAIN (ANALYZE)
       SELECT "id", "order_id", "product_id", "quantity", "price"
       FROM "public"."Order_item"
       WHERE "order_id" IN ($1)
       OFFSET 0`,
        order.id,
      )) as { 'QUERY PLAN': string }[];
      explains.push(orderItemsExplain);

      const orderItems = (await this.prisma.$queryRawUnsafe(
        `SELECT "id", "order_id", "product_id", "quantity", "price"
       FROM "public"."Order_item"
       WHERE "order_id" IN ($1)
       OFFSET 0`,
        order.id,
      )) as { product_id: number; quantity: number }[];

      for (const item of orderItems) {
        const productSelectExplain = (await this.prisma.$queryRawUnsafe(
          `EXPLAIN (ANALYZE)
         SELECT "id", "name", "description", "price", "stock", "last_updated", "category_id"
         FROM "public"."Product"
         WHERE ("id" = $1 AND 1=1)
         LIMIT 1 OFFSET 0`,
          item.product_id,
        )) as { 'QUERY PLAN': string }[];
        explains.push(productSelectExplain);

        const [product] = (await this.prisma.$queryRawUnsafe(
          `SELECT "id", "name", "description", "price", "stock", "last_updated", "category_id"
         FROM "public"."Product"
         WHERE ("id" = $1 AND 1=1)
         LIMIT 1 OFFSET 0`,
          item.product_id,
        )) as Product[];

        if (!product) {
          throw new Error(`Product with id ${item.product_id} not found`);
        }

        const newStock = product.stock + item.quantity;

        if (newStock < 0) {
          throw new Error(
            `Product with id ${product.id} has less stock (${product.stock}) than required (${item.quantity})`,
          );
        }

        const productUpdateExplain = (await this.prisma.$queryRawUnsafe(
          `EXPLAIN (ANALYZE)
         UPDATE "public"."Product"
         SET "stock" = $1
         WHERE ("id" = $2 AND 1=1)
         RETURNING "id", "name", "description", "price", "stock", "last_updated", "category_id"`,
          newStock,
          product.id,
        )) as { 'QUERY PLAN': string }[];
        explains.push(productUpdateExplain);

        (await this.prisma.$queryRawUnsafe(
          `UPDATE "public"."Product"
         SET "stock" = $1
         WHERE ("id" = $2 AND 1=1)
         RETURNING "id", "name", "description", "price", "stock", "last_updated", "category_id"`,
          newStock,
          product.id,
        )) as Product[];
      }

      const orderUpdateExplain = (await this.prisma.$queryRawUnsafe(
        `EXPLAIN (ANALYZE)
       UPDATE "public"."Order"
       SET "status" = CAST('confirmed'::text AS "public"."Order_status_enum")
       WHERE ("id" = $1 AND 1=1)
       RETURNING "id", "user_id", "status"::text, "total_price", "created_at"`,
        Number(orderId),
      )) as { 'QUERY PLAN': string }[];
      explains.push(orderUpdateExplain);

      (await this.prisma.$queryRawUnsafe(
        `UPDATE "public"."Order"
       SET "status" = CAST('confirmed'::text AS "public"."Order_status_enum")
       WHERE ("id" = $1 AND 1=1)
       RETURNING "id", "user_id", "status"::text, "total_price", "created_at"`,
        Number(orderId),
      )) as Order[];

      return sumExplainTimes(...explains);
    });
  }
}
