import { Injectable } from '@nestjs/common';
import { OrderStatusEnum, Product } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { IOrdersServiceImplementation, Order } from 'src/orders/orders.types';
import { measureTime } from 'src/utils/utils.helpers';

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

          const newStock = product.stock - item.quantity;

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
      return this.prisma.$transaction(async (tx) => {
        const [order] = (await tx.$queryRawUnsafe<any[]>(
          `SELECT "id", "user_id", "status"::text, "total_price", "created_at"
         FROM "public"."Order"
         WHERE "id" = $1
         LIMIT 1 OFFSET 0`,
          Number(orderId),
        )) as [Order];

        if (!order) {
          throw new Error('Order not found');
        }

        const orderItems = await tx.$queryRawUnsafe<any[]>(
          `SELECT "id", "order_id", "product_id", "quantity", "price"
         FROM "public"."Order_item"
         WHERE "order_id" = $1
         OFFSET 0`,
          Number(orderId),
        );

        for (const item of orderItems) {
          const [product] = (await tx.$queryRawUnsafe<any[]>(
            `SELECT "id", "name", "description", "price", "stock", "last_updated", "category_id"
           FROM "public"."Product"
           WHERE "id" = $1
           LIMIT 1 OFFSET 0`,
            item.product_id,
          )) as [Product];

          if (!product) {
            throw new Error(`Product with id ${item.product_id} not found`);
          }

          const updatedStock = product.stock - item.quantity;
          if (updatedStock < 0) {
            throw new Error(
              `Product with id ${product.id} has less than required (${item.quantity}) in stock (currently ${product.stock})`,
            );
          }

          await tx.$queryRawUnsafe(
            `UPDATE "public"."Product"
           SET "stock" = $1
           WHERE "id" = $2
           RETURNING "id", "name", "description", "price", "stock", "last_updated", "category_id"`,
            updatedStock,
            product.id,
          );
        }

        await tx.$queryRawUnsafe(
          `UPDATE "public"."Order"
         SET "status" = CAST($1::text AS "public"."Order_status_enum")
         WHERE "id" = $2
         RETURNING "id", "user_id", "status"::text, "total_price", "created_at"`,
          'confirmed',
          Number(orderId),
        );

        return true;
      });
    });

    return result;
  }
}
