import { Body, Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { BaseResponse, ORM, QueryType } from 'src/utils/utils.types';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(
    @Query('categoryId') categoryId: string,
    @Query('filterName') filterName: string,
    @Query('sortDirection') sortDirection: 'ASC' | 'DESC',
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('orm') orm: ORM,
    @Query('queryType') queryType: QueryType,
  ): Promise<BaseResponse<unknown>> {
    return await this.productsService.call(orm, 'getProducts', queryType, [
      {
        categoryId: Number(categoryId),
        filterName,
        sortDirection,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    ]);
  }
}
