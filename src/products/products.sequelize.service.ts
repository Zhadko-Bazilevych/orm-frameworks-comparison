import { Inject, Injectable } from '@nestjs/common';
import { Product as ProductModel } from 'src/db/sequelize/models/product.model';
import {
  IProductsServiceImplementation,
  Product,
  ProductRequestBody,
} from 'src/products/products.types';
import { measureTime } from 'src/utils/utils.helpers';

@Injectable()
export class ProductsSequelizeService
  implements IProductsServiceImplementation
{
  constructor(
    @Inject('PRODUCT_MODEL_SEQUELIZE')
    private productModel: typeof ProductModel,
  ) {}

  async getProductsDefault(filterData: ProductRequestBody) {
    const offset = (filterData.page - 1) * filterData.pageSize;

    const result = await measureTime(() => {
      return this.productModel.findAll({
        where: { categoryId: filterData.categoryId },
        order: [['name', filterData.sortDirection]],
        offset: offset,
        limit: filterData.pageSize,
      });
    });

    return result;
  }

  async getProductsRaw(filterData: ProductRequestBody) {
    const offset = (filterData.page - 1) * filterData.pageSize;
    const result = measureTime(async () => {
      const [updatedUser] = (await this.productModel.sequelize!.query(
        `SELECT "id", "name", "description", "price", "stock", "category_id" AS "categoryId", 
        "last_updated" AS "lastUpdated" FROM "Product" AS "product" 
        WHERE "product"."category_id" = $1
        ORDER BY "product"."name" ASC 
        LIMIT $2 
        OFFSET $3;`,
        {
          bind: [filterData.categoryId, filterData.pageSize, offset],
        },
      )) as [Product[], unknown];
      return updatedUser;
    });

    return result;
  }

  async getProductsExplain(filterData: ProductRequestBody) {
    const offset = (filterData.page - 1) * filterData.pageSize;
    const result = measureTime(async () => {
      const [explain] = await this.productModel.sequelize!.query(
        `EXPLAIN (ANALYZE)
       SELECT "id", "name", "description", "price", "stock", "category_id" AS "categoryId", "last_updated" AS "lastUpdated"
       FROM "Product" AS "product"
       WHERE "product"."category_id" = $1
       ORDER BY "product"."name" ASC
       LIMIT $2 OFFSET $3;`,
        {
          bind: [filterData.categoryId, filterData.pageSize, offset],
        },
      );
      return explain;
    });

    return result;
  }
}
