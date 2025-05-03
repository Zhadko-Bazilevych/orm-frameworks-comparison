import {
  IUsersServiceImplementation,
  User,
  UsersFindAllResponse,
} from 'src/users/users.types';
import { BaseResponse } from 'src/utils/utils.types';

export class UsersSequelizeService implements IUsersServiceImplementation {
  async getUsersDefault(): Promise<UsersFindAllResponse> {
    return { data: [], timeMs: 0 };
  }

  async getUsersRaw(): Promise<UsersFindAllResponse> {
    return { data: [], timeMs: 0 };
  }

  async deleteUserDefault(id: number): Promise<BaseResponse<User>> {
    return {
      data: { email: '', fullName: '', id: 0, passwordHash: '' },
      timeMs: 0,
    };
  }

  async deleteUserRaw(id: number): Promise<BaseResponse<User>> {
    return {
      data: { email: '', fullName: '', id: 0, passwordHash: '' },
      timeMs: 0,
    };
  }
}
