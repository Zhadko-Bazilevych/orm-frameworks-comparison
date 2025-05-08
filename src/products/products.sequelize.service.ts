import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
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
    @InjectModel(ProductModel) private productModel: typeof ProductModel,
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
        `SELECT "id", "name", "description", "price", "stock", "category_id" AS "categoryId", "last_updated" AS "lastUpdated" FROM "Product" AS "product" WHERE "product"."category_id" = '${filterData.categoryId}' ORDER BY "product"."name" ASC LIMIT '${filterData.pageSize}' OFFSET ${offset};`,
      )) as [Product[], unknown];
      return updatedUser;
    });

    return result;
  }
}
