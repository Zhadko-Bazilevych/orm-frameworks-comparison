import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { OrdersService } from 'src/orders/orders.service';
import { Order } from 'src/orders/orders.types';
import { BaseResponse, ORM, QueryType } from 'src/utils/utils.types';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrder(
    @Query('id') id: number,
    @Query('orm') orm: ORM,
    @Query('queryType') queryType: QueryType,
  ): Promise<unknown> {
    return await this.ordersService.call(orm, 'getOrder', queryType, [id]);
  }

  // @Delete()
  // async deleteOrder(
  //   @Query('id') id: number,
  //   @Query('orm') orm: ORM,
  //   @Query('queryType') queryType: QueryType,
  // ): Promise<BaseResponse<boolean>> {
  //   return await this.ordersService.call(orm, 'deleteOrder', queryType, [id]);
  // }

  @Post()
  async createOrder(
    @Body()
    orderData: Order,
    @Query('orm') orm: ORM,
    @Query('queryType') queryType: QueryType,
  ): Promise<BaseResponse<unknown>> {
    const result = await this.ordersService.call(
      orm,
      'createOrder',
      queryType,
      [orderData],
    );
    return result;
  }

  @Put()
  async confirmOrder(
    @Query('orderId') orderId: string,
    @Query('orm') orm: ORM,
    @Query('queryType') queryType: QueryType,
  ): Promise<BaseResponse<boolean>> {
    const result = await this.ordersService.call(
      orm,
      'confirmOrder',
      queryType,
      [Number(orderId)],
    );
    return result;
  }
}
