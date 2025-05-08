import { Body, Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { Product } from 'src/products/products.types';
import { BaseResponse, ORM, QueryType } from 'src/utils/utils.types';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(
    @Query('categoryId') categoryId: number,
    @Query('filterName') filterName: string,
    @Query('sortDirection') sortDirection: 'ASC' | 'DESC',
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('orm') orm: ORM,
    @Query('queryType') queryType: QueryType,
  ): Promise<BaseResponse<Product | Product[]>> {
    return await this.productsService.call(orm, 'getProducts', queryType, [
      { categoryId, filterName, sortDirection, page, pageSize },
    ]);
  }
}
