import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import {
  IProductsServiceImplementation,
  Product,
  ProductRequestBody,
} from 'src/products/products.types';
import { measureTime } from 'src/utils/utils.helpers';

@Injectable()
export class ProductsPrismaService implements IProductsServiceImplementation {
  constructor(private prisma: PrismaService) {}

  async getProductsDefault(filterData: ProductRequestBody) {
    const offset = (filterData.page - 1) * filterData.pageSize;
    const result = await measureTime(() => {
      return this.prisma.product.findMany({
        where: {
          categoryId: Number(filterData.categoryId),
        },
        orderBy: {
          name: filterData.sortDirection.toLowerCase() as 'asc' | 'desc',
        },
        skip: offset,
        take: Number(filterData.pageSize),
      });
    });

    return result;
  }

  async getProductsRaw(filterData: ProductRequestBody) {
    const offset = (filterData.page - 1) * filterData.pageSize;
    const categoryId = Number(filterData.categoryId);
    const limit = Number(filterData.pageSize);
    const direction = filterData.sortDirection.toLowerCase();

    const result = await measureTime(async () => {
      const products = await this.prisma.$queryRawUnsafe<Product[]>(
        `
      SELECT "id", "name", "description", "price", "stock", "last_updated", "category_id"
      FROM "public"."Product"
      WHERE "category_id" = $1
      ORDER BY "name" ${direction}
      LIMIT $2 OFFSET $3
      `,
        categoryId,
        limit,
        offset,
      );
      return products;
    });

    return result;
  }

  async getProductsExplain(filterData: ProductRequestBody) {
    const offset = (filterData.page - 1) * filterData.pageSize;
    const categoryId = Number(filterData.categoryId);
    const limit = Number(filterData.pageSize);
    const direction = filterData.sortDirection.toLowerCase();

    const result = await measureTime(async () => {
      const explain = await this.prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE)
      SELECT "id", "name", "description", "price", "stock", "last_updated", "category_id"
      FROM "public"."Product"
      WHERE "category_id" = ${categoryId}
      ORDER BY "name" ${direction}
      LIMIT ${limit} OFFSET ${offset}
    `);
      return explain;
    });

    return result;
  }
}
