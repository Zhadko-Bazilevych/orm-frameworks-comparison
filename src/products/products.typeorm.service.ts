import { Inject, Injectable } from '@nestjs/common';
import {
  IProductsServiceImplementation,
  Product,
  ProductRequestBody,
} from 'src/products/products.types';
import { measureTime } from 'src/utils/utils.helpers';
import { Product as ProductEntity } from 'src/db/typeorm/models/product.model';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsTypeOrmService implements IProductsServiceImplementation {
  constructor(
    @Inject('PRODUCT_REPOSITORY_TYPEORM')
    private productRepository: Repository<ProductEntity>,
  ) {}

  async getProductsDefault(filterData: ProductRequestBody) {
    const offset = (filterData.page - 1) * filterData.pageSize;

    const result = await measureTime(() =>
      this.productRepository.find({
        where: {
          categoryId: filterData.categoryId,
        },
        order: {
          name: filterData.sortDirection as 'ASC' | 'DESC',
        },
        skip: offset,
        take: filterData.pageSize,
      }),
    );

    return result;
  }

  async getProductsRaw(filterData: ProductRequestBody) {
    const dataSource = this.productRepository.manager.connection;
    const offset = (filterData.pageSize - 1) * filterData.page;
    const result = await measureTime(async () => {
      const response: Product[] = await dataSource.query(
        `SELECT "Product"."id" AS "Product_id", "Product"."name" AS "Product_name", "Product"."description" AS "Product_description", "Product"."price" AS "Product_price", "Product"."stock" AS "Product_stock", "Product"."category_id" AS "Product_category_id", "Product"."last_updated" AS "Product_last_updated" FROM "Product" "Product" WHERE (("Product"."category_id" = $1)) ORDER BY "Product"."name" ${filterData.sortDirection} LIMIT ${filterData.pageSize} OFFSET ${offset}`,
        [filterData.categoryId],
      );
      return response;
    });

    return result;
  }

  async getProductsExplain(filterData: ProductRequestBody) {
    const dataSource = this.productRepository.manager.connection;
    const offset = (filterData.pageSize - 1) * filterData.page;

    const result = await measureTime(async () => {
      const explain: unknown = await dataSource.query(
        `EXPLAIN (ANALYZE)
       SELECT "Product"."id" AS "Product_id",
              "Product"."name" AS "Product_name",
              "Product"."description" AS "Product_description",
              "Product"."price" AS "Product_price",
              "Product"."stock" AS "Product_stock",
              "Product"."category_id" AS "Product_category_id",
              "Product"."last_updated" AS "Product_last_updated"
       FROM "Product" "Product"
       WHERE "Product"."category_id" = $1
       ORDER BY "Product"."name" ${filterData.sortDirection}
       LIMIT ${filterData.pageSize} OFFSET ${offset}`,
        [filterData.categoryId],
      );
      return explain;
    });

    return result;
  }
}
