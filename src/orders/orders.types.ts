import { BaseResponse } from 'src/utils/utils.types';
import {
  GetServiceImplementation,
  InterfaceToType,
} from 'src/utils/utils.types';

export interface IOrdersServiceImplementation
  extends GetServiceImplementation<InterfaceToType<IOrdersService>> {}

export type OrderStatus =
  | 'pending'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'paid';

export type Order = {
  id?: number;
  userId: number;
  status: string;
  totalPrice: string;
  createdAt?: Date;
  orderItems?: OrderItem[];
};

export type OrderItem = {
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
};

export interface IOrdersService {
  getOrder(id: number): Promise<BaseResponse<Order | Order[]>>;
  // deleteOrder(id: number): Promise<BaseResponse<boolean>>;
  createOrder(body: Order): Promise<BaseResponse<Order>>;
  // updateOrder(body: Order): Promise<BaseResponse<Order>>;
}
