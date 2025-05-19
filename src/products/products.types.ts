import { BaseResponse } from 'src/utils/utils.types';
import {
  GetServiceImplementation,
  InterfaceToType,
} from 'src/utils/utils.types';

export interface IProductsServiceImplementation
  extends GetServiceImplementation<InterfaceToType<IProductsService>> {}

export type Product = {
  id?: number;
  name: string;
  description?: string;
  price: string;
  stock: number;
  categoryId?: number;
  lastUpdated?: Date;
};

export type ProductRequestBody = {
  categoryId: number;
  filterName: string;
  sortDirection: string;
  page: number;
  pageSize: number;
};

export interface IProductsService {
  getProducts(filterData: ProductRequestBody): Promise<BaseResponse<unknown>>;
}
