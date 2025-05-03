import { BaseResponse } from 'src/utils/utils.types';
import {
  GetServiceImplementation,
  InterfaceToType,
} from 'src/utils/utils.types';

export interface IUsersServiceImplementation
  extends GetServiceImplementation<InterfaceToType<IUsersService>> {}

export type User = {
  id: number;
  email: string;
  passwordHash: string;
  fullName: string;
};

export type UsersFindAllResponse = BaseResponse<User[]>;

export interface IUsersService {
  getUsers(): Promise<UsersFindAllResponse>;
  deleteUser(id: number): Promise<BaseResponse<User>>;
}
