import { BaseResponse } from 'src/utils/utils.types';
import {
  GetServiceImplementation,
  InterfaceToType,
} from 'src/utils/utils.types';

export interface IOrdersServiceImplementation
  extends GetServiceImplementation<InterfaceToType<IOrdersService>> {}

export type OrderStatus =
  | 'processing'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

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

export type OrderItemRaw = {
  id: number;
  userId: number;
  status: string;
  totalPrice: number;
  created_at: string;
  'orderItems.orderId': number;
  'orderItems.productId': number;
  'orderItems.quantity': number;
  'orderItems.price': number;
};

export type ProductRaw = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  lastUpdated: string;
};

export interface IOrdersService {
  getOrder(id: number): Promise<BaseResponse<unknown>>;
  createOrder(body: Order): Promise<BaseResponse<unknown>>;
  confirmOrder(id: number): Promise<BaseResponse<boolean>>;
}
