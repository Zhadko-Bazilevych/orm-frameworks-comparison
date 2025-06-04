import { Inject, Injectable } from '@nestjs/common';
import { IOrdersServiceImplementation, Order } from 'src/orders/orders.types';
import { Order as OrderEntity } from 'src/db/typeorm/models/order.model';
import { Product as ProductEntity } from 'src/db/typeorm/models/product.model';
import { measureTime, sumExplainTimes } from 'src/utils/utils.helpers';
import { Repository } from 'typeorm';
import { OrderItem } from 'src/db/typeorm/models/order-item.model';

@Injectable()
export class OrdersTypeOrmService implements IOrdersServiceImplementation {
  constructor(
    @Inject('ORDER_REPOSITORY_TYPEORM')
    private orderRepository: Repository<OrderEntity>,
    @Inject('PRODUCT_REPOSITORY_TYPEORM')
    private productModel: Repository<ProductEntity>,
  ) {}

  async getOrderDefault(id: number) {
    const result = measureTime(() => {
      return this.orderRepository.findOne({
        where: { id },
        relations: ['orderItems'],
      }) as Promise<Order>;
    });
    return result;
  }

  async getOrderRaw(id: number) {
    const dataSource = this.orderRepository.manager.connection;

    const query1 = `SELECT DISTINCT "distinctAlias"."Order_id" AS "ids_Order_id" FROM (SELECT "Order"."id" AS "Order_id", "Order"."user_id" AS "Order_user_id", "Order"."status" AS 
"Order_status", "Order"."total_price" AS "Order_total_price", "Order"."created_at" AS "Order_created_at", "Order__Order_orderItems"."id" AS "Order__Order_orderItems_id", "Order__Order_orderItems"."order_id" AS "Order__Order_orderItems_order_id", "Order__Order_orderItems"."product_id" AS "Order__Order_orderItems_product_id", "Order__Order_orderItems"."quantity" AS "Order__Order_orderItems_quantity", "Order__Order_orderItems"."price" AS "Order__Order_orderItems_price" FROM "Order" "Order" LEFT JOIN "Order_item" "Order__Order_orderItems" ON "Order__Order_orderItems"."order_id"="Order"."id" WHERE (("Order"."id" = $1))) "distinctAlias" ORDER BY "Order_id" ASC LIMIT 1`;

    const query2 = `SELECT "Order"."id" AS "Order_id", "Order"."user_id" AS "Order_user_id", "Order"."status" AS "Order_status", "Order"."total_price" AS "Order_total_price", "Order"."created_at" AS "Order_created_at", "Order__Order_orderItems"."id" AS "Order__Order_orderItems_id", "Order__Order_orderItems"."order_id" AS "Order__Order_orderItems_order_id", "Order__Order_orderItems"."product_id" AS "Order__Order_orderItems_product_id", "Order__Order_orderItems"."quantity" AS "Order__Order_orderItems_quantity", "Order__Order_orderItems"."price" AS "Order__Order_orderItems_price" FROM "Order" "Order" LEFT JOIN "Order_item" "Order__Order_orderItems" ON "Order__Order_orderItems"."order_id"="Order"."id" WHERE ( (("Order"."id" = $1)) ) AND ( "Order"."id" IN (2) )`;

    const result = await measureTime(async () => {
      const firstQueryResult = (await dataSource.query(query1, [
        id,
      ])) as unknown;
      const secondQueryResult = (await dataSource.query(query2, [
        id,
      ])) as unknown;
      return [firstQueryResult, secondQueryResult];
    });

    return result;
  }

  async getOrderExplain(id: number) {
    const dataSource = this.orderRepository.manager.connection;

    const explainQuery1 = `EXPLAIN (ANALYZE)
    SELECT DISTINCT "distinctAlias"."Order_id" AS "ids_Order_id" FROM ( SELECT "Order"."id" AS "Order_id", "Order"."user_id" AS "Order_user_id", "Order"."status" AS "Order_status", "Order"."total_price" AS "Order_total_price", "Order"."created_at" AS "Order_created_at", "Order__Order_orderItems"."id" AS "Order__Order_orderItems_id", "Order__Order_orderItems"."order_id" AS "Order__Order_orderItems_order_id", "Order__Order_orderItems"."product_id" AS "Order__Order_orderItems_product_id", "Order__Order_orderItems"."quantity" AS "Order__Order_orderItems_quantity", "Order__Order_orderItems"."price" AS "Order__Order_orderItems_price" FROM "Order" "Order" LEFT JOIN "Order_item" "Order__Order_orderItems" ON "Order__Order_orderItems"."order_id" = "Order"."id" WHERE "Order"."id" = $1 ) "distinctAlias" ORDER BY "Order_id" ASC LIMIT 1
  `;

    const explainQuery2 = `EXPLAIN (ANALYZE)
    SELECT "Order"."id" AS "Order_id", "Order"."user_id" AS "Order_user_id", "Order"."status" AS "Order_status", "Order"."total_price" AS "Order_total_price", "Order"."created_at" AS "Order_created_at", "Order__Order_orderItems"."id" AS "Order__Order_orderItems_id", "Order__Order_orderItems"."order_id" AS "Order__Order_orderItems_order_id", "Order__Order_orderItems"."product_id" AS "Order__Order_orderItems_product_id", "Order__Order_orderItems"."quantity" AS "Order__Order_orderItems_quantity", "Order__Order_orderItems"."price" AS "Order__Order_orderItems_price" FROM "Order" "Order" LEFT JOIN "Order_item" "Order__Order_orderItems" ON "Order__Order_orderItems"."order_id" = "Order"."id" WHERE "Order"."id" = $1 AND "Order"."id" IN (2)
  `;

    const result = await measureTime(async () => {
      const explain1 = (await dataSource.query(explainQuery1, [id])) as {
        'QUERY PLAN': string;
      }[];
      const explain2 = (await dataSource.query(explainQuery2, [id])) as {
        'QUERY PLAN': string;
      }[];

      return sumExplainTimes(explain1, explain2);
    });

    return result;
  }

  async createOrderDefault(order: OrderEntity) {
    const result = measureTime(async () => {
      const orderWithItems = this.orderRepository.create(order);
      return await this.orderRepository.save(orderWithItems);
    });
    return result;
  }

  async createOrderRaw(order: Order) {
    const dataSource = this.orderRepository.manager.connection;

    const values: string[] = [];
    const parameters: any[] = [];
    let paramIndex = 1;

    const result = await measureTime(async () => {
      const [newOrder] = (await dataSource.query(
        `INSERT INTO "Order"("user_id", "status", "total_price", "created_at")
       VALUES ($1, $2, $3, DEFAULT)
       RETURNING "id", "status";`,
        [order.userId, order.status, order.totalPrice],
      )) as Order[];

      if (!order.orderItems?.length) return newOrder;

      for (const item of order.orderItems) {
        values.push(
          `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`,
        );
        parameters.push(newOrder.id, item.productId, item.quantity, item.price);
        paramIndex += 4;
      }

      const itemsQuery = `
      INSERT INTO "Order_item"("order_id", "product_id", "quantity", "price")
      VALUES ${values.join(', ')}
      RETURNING "id";
    `;

      const newOrderItems = (await dataSource.query(
        itemsQuery,
        parameters,
      )) as OrderItem[];

      return [newOrder, newOrderItems];
    });

    return result;
  }

  async createOrderExplain(order: Order) {
    const dataSource = this.orderRepository.manager.connection;

    const values: string[] = [];
    const parameters: any[] = [];
    let paramIndex = 1;

    const result = await measureTime(async () => {
      const explainOrderInsert = (await dataSource.query(
        `EXPLAIN (ANALYZE)
       INSERT INTO "Order"("user_id", "status", "total_price", "created_at")
       VALUES ($1, $2, $3, DEFAULT)
       RETURNING "id", "status";`,
        [order.userId, order.status, order.totalPrice],
      )) as { 'QUERY PLAN': string }[];

      const [newOrder] = (await dataSource.query(
        `INSERT INTO "Order"("user_id", "status", "total_price", "created_at")
       VALUES ($1, $2, $3, DEFAULT)
       RETURNING "id", "status";`,
        [order.userId, order.status, order.totalPrice],
      )) as Order[];

      if (!order.orderItems?.length) {
        return sumExplainTimes(
          explainOrderInsert as { 'QUERY PLAN': string }[],
        );
      }

      for (const item of order.orderItems) {
        values.push(
          `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`,
        );
        parameters.push(newOrder.id, item.productId, item.quantity, item.price);
        paramIndex += 4;
      }

      const explainItemsInsert = (await dataSource.query(
        `EXPLAIN (ANALYZE) INSERT INTO "Order_item"("order_id", "product_id", "quantity", "price")
      VALUES ${values.join(', ')}
      RETURNING "id";`,
        parameters,
      )) as { 'QUERY PLAN': string }[];

      return sumExplainTimes(explainOrderInsert, explainItemsInsert);
    });

    return result;
  }

  async confirmOrderDefault(orderId: number) {
    const result = await measureTime(async () => {
      return this.orderRepository.manager.transaction(async (manager) => {
        const order = await manager.findOne(OrderEntity, {
          where: { id: orderId },
          relations: ['orderItems'],
        });

        if (!order) {
          throw new Error('Order not found');
        }

        for (const item of order.orderItems) {
          const product = await manager.findOne(ProductEntity, {
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Product with id ${item.productId} not found`);
          }

          product.stock += item.quantity;

          if (product.stock < 0) {
            throw new Error(
              `Product with id ${product.id} has less than required ${item.quantity} in stock (currently ${product.stock})`,
            );
          }

          await manager.save(product);
        }

        order.status = 'confirmed';
        await manager.save(order);

        return true;
      });
    });

    return result;
  }

  async confirmOrderRaw(orderId: number) {
    const dataSource = this.orderRepository.manager.connection;

    const result = await measureTime(() => {
      return dataSource.transaction(async (manager) => {
        const orderResult = (await manager.query(
          `
        SELECT DISTINCT "distinctAlias"."Order_id" AS "ids_Order_id" 
        FROM (
          SELECT "Order"."id" AS "Order_id", "Order"."user_id" AS "Order_user_id", 
                 "Order"."status" AS "Order_status", "Order"."total_price" AS "Order_total_price", 
                 "Order"."created_at" AS "Order_created_at", "Order__Order_orderItems"."id" AS "Order__Order_orderItems_id", 
                 "Order__Order_orderItems"."order_id" AS "Order__Order_orderItems_order_id", 
                 "Order__Order_orderItems"."product_id" AS "Order__Order_orderItems_product_id", 
                 "Order__Order_orderItems"."quantity" AS "Order__Order_orderItems_quantity", 
                 "Order__Order_orderItems"."price" AS "Order__Order_orderItems_price"
          FROM "Order" "Order"
          LEFT JOIN "Order_item" "Order__Order_orderItems" 
          ON "Order__Order_orderItems"."order_id" = "Order"."id"
          WHERE "Order"."id" = $1
        ) "distinctAlias"
        ORDER BY "Order_id" ASC 
        LIMIT 1
        `,
          [orderId],
        )) as unknown[];

        if (orderResult.length === 0) {
          throw new Error('Order not found');
        }

        const orderItems = (await manager.query(
          `
        SELECT "OrderItem"."id" AS "OrderItem_id", "OrderItem"."order_id" AS "OrderItem_order_id", 
               "OrderItem"."product_id" AS "OrderItem_product_id", "OrderItem"."quantity" AS "OrderItem_quantity", 
               "OrderItem"."price" AS "OrderItem_price"
        FROM "Order_item" "OrderItem"
        WHERE "OrderItem"."order_id" = $1
        `,
          [orderId],
        )) as unknown[];

        for (const item of orderItems as any[]) {
          const productId = item.OrderItem_product_id as number;

          const productResult = (await manager.query(
            `
    SELECT "Product"."id" AS "Product_id", "Product"."name" AS "Product_name", 
           "Product"."description" AS "Product_description", "Product"."price" AS "Product_price", 
           "Product"."stock" AS "Product_stock", "Product"."category_id" AS "Product_category_id", 
           "Product"."last_updated" AS "Product_last_updated"
    FROM "Product" "Product"
    WHERE "Product"."id" = $1
    LIMIT 1
    `,
            [productId],
          )) as unknown[];

          if (productResult.length === 0) {
            throw new Error(`Product not found for id ${productId}`);
          }

          const product: any = productResult[0];
          const newStock = (product.Product_stock +
            item.OrderItem_quantity) as number;

          if (newStock < 0) {
            throw new Error(`Not enough stock for product ${productId}`);
          }

          await manager.query(
            `
          UPDATE "Product" SET "stock" = $1 
          WHERE "id" = $2
            `,
            [newStock, productId],
          );
        }

        await manager.query(
          `
        UPDATE "Order" SET "status" = 'confirmed'
        WHERE "id" = $1
        `,
          [orderId],
        );

        return true;
      });
    });

    return result;
  }

  async confirmOrderExplain(orderId: number) {
    const dataSource = this.orderRepository.manager.connection;

    const result = await measureTime(() =>
      dataSource.transaction(async (manager) => {
        const explainOrderSelect = (await manager.query(
          `
        EXPLAIN (ANALYZE)
        SELECT DISTINCT "distinctAlias"."Order_id" AS "ids_Order_id"
        FROM (
          SELECT "Order"."id" AS "Order_id", "Order"."user_id" AS "Order_user_id", 
                 "Order"."status" AS "Order_status", "Order"."total_price" AS "Order_total_price", 
                 "Order"."created_at" AS "Order_created_at", "Order__Order_orderItems"."id" AS "Order__Order_orderItems_id", 
                 "Order__Order_orderItems"."order_id" AS "Order__Order_orderItems_order_id", 
                 "Order__Order_orderItems"."product_id" AS "Order__Order_orderItems_product_id", 
                 "Order__Order_orderItems"."quantity" AS "Order__Order_orderItems_quantity", 
                 "Order__Order_orderItems"."price" AS "Order__Order_orderItems_price"
          FROM "Order" "Order"
          LEFT JOIN "Order_item" "Order__Order_orderItems" 
          ON "Order__Order_orderItems"."order_id" = "Order"."id"
          WHERE "Order"."id" = $1
        ) "distinctAlias"
        ORDER BY "Order_id" ASC 
        LIMIT 1
        `,
          [orderId],
        )) as { 'QUERY PLAN': string }[];

        const orderResult = (await manager.query(
          `
        SELECT DISTINCT "distinctAlias"."Order_id" AS "ids_Order_id" 
        FROM (
          SELECT "Order"."id" AS "Order_id", "Order"."user_id" AS "Order_user_id", 
                 "Order"."status" AS "Order_status", "Order"."total_price" AS "Order_total_price", 
                 "Order"."created_at" AS "Order_created_at", "Order__Order_orderItems"."id" AS "Order__Order_orderItems_id", 
                 "Order__Order_orderItems"."order_id" AS "Order__Order_orderItems_order_id", 
                 "Order__Order_orderItems"."product_id" AS "Order__Order_orderItems_product_id", 
                 "Order__Order_orderItems"."quantity" AS "Order__Order_orderItems_quantity", 
                 "Order__Order_orderItems"."price" AS "Order__Order_orderItems_price"
          FROM "Order" "Order"
          LEFT JOIN "Order_item" "Order__Order_orderItems" 
          ON "Order__Order_orderItems"."order_id" = "Order"."id"
          WHERE "Order"."id" = $1
        ) "distinctAlias"
        ORDER BY "Order_id" ASC 
        LIMIT 1
        `,
          [orderId],
        )) as unknown[];

        if (orderResult.length === 0) {
          throw new Error('Order not found');
        }

        const orderItemsExplain = (await manager.query(
          `
        EXPLAIN (ANALYZE)
        SELECT "OrderItem"."id" AS "OrderItem_id", "OrderItem"."order_id" AS "OrderItem_order_id", 
               "OrderItem"."product_id" AS "OrderItem_product_id", "OrderItem"."quantity" AS "OrderItem_quantity", 
               "OrderItem"."price" AS "OrderItem_price"
        FROM "Order_item" "OrderItem"
        WHERE "OrderItem"."order_id" = $1
        `,
          [orderId],
        )) as { 'QUERY PLAN': string }[];

        const orderItems = (await manager.query(
          `
        SELECT "OrderItem"."id" AS "OrderItem_id", "OrderItem"."order_id" AS "OrderItem_order_id", 
               "OrderItem"."product_id" AS "OrderItem_product_id", "OrderItem"."quantity" AS "OrderItem_quantity", 
               "OrderItem"."price" AS "OrderItem_price"
        FROM "Order_item" "OrderItem"
        WHERE "OrderItem"."order_id" = $1
        `,
          [orderId],
        )) as unknown[];

        const productExplains: { 'QUERY PLAN': string }[][] = [];
        const updateStockExplains: { 'QUERY PLAN': string }[][] = [];

        for (const item of orderItems as any[]) {
          const productId = item.OrderItem_product_id as number;

          const explainProductSelect = (await manager.query(
            `
          EXPLAIN (ANALYZE)
          SELECT "Product"."id" AS "Product_id", "Product"."name" AS "Product_name", 
                 "Product"."description" AS "Product_description", "Product"."price" AS "Product_price", 
                 "Product"."stock" AS "Product_stock", "Product"."category_id" AS "Product_category_id", 
                 "Product"."last_updated" AS "Product_last_updated"
          FROM "Product" "Product"
          WHERE "Product"."id" = $1
          LIMIT 1
          `,
            [productId],
          )) as { 'QUERY PLAN': string }[];

          const productResult = (await manager.query(
            `
          SELECT "Product"."id" AS "Product_id", "Product"."name" AS "Product_name", 
                 "Product"."description" AS "Product_description", "Product"."price" AS "Product_price", 
                 "Product"."stock" AS "Product_stock", "Product"."category_id" AS "Product_category_id", 
                 "Product"."last_updated" AS "Product_last_updated"
          FROM "Product" "Product"
          WHERE "Product"."id" = $1
          LIMIT 1
          `,
            [productId],
          )) as unknown[];

          if (productResult.length === 0) {
            throw new Error(`Product not found for id ${productId}`);
          }

          const product: any = productResult[0];
          const newStock = (product.Product_stock +
            item.OrderItem_quantity) as number;

          if (newStock < 0) {
            throw new Error(`Not enough stock for product ${productId}`);
          }

          const explainUpdateStock = (await manager.query(
            `
          EXPLAIN (ANALYZE)
          UPDATE "Product" SET "stock" = $1 
          WHERE "id" = $2
          `,
            [newStock, productId],
          )) as { 'QUERY PLAN': string }[];

          await manager.query(
            `
          UPDATE "Product" SET "stock" = $1 
          WHERE "id" = $2
          `,
            [newStock, productId],
          );

          productExplains.push(explainProductSelect);
          updateStockExplains.push(explainUpdateStock);
        }

        const explainOrderUpdate = (await manager.query(
          `
        EXPLAIN (ANALYZE)
        UPDATE "Order" SET "status" = 'confirmed'
        WHERE "id" = $1
        `,
          [orderId],
        )) as { 'QUERY PLAN': string }[];

        await manager.query(
          `
        UPDATE "Order" SET "status" = 'confirmed'
        WHERE "id" = $1
        `,
          [orderId],
        );

        return sumExplainTimes(
          explainOrderSelect,
          orderItemsExplain,
          ...productExplains,
          ...updateStockExplains,
          explainOrderUpdate,
        );
      }),
    );

    return result;
  }
}
