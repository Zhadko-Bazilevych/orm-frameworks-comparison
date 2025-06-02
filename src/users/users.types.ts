import { BaseResponse } from 'src/utils/utils.types';
import {
  GetServiceImplementation,
  InterfaceToType,
} from 'src/utils/utils.types';

export interface IUsersServiceImplementation
  extends GetServiceImplementation<InterfaceToType<IUsersService>> {}

export type User = {
  id?: number;
  email: string;
  passwordHash: string;
  fullName: string;
};

export interface IUsersService {
  getUser(id: number): Promise<BaseResponse<unknown>>;
  deleteUser(id: number): Promise<BaseResponse<unknown>>;
  createUser(body: User): Promise<BaseResponse<unknown>>;
  updateUser(body: User): Promise<BaseResponse<unknown>>;
}
