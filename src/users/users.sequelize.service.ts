import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/db/sequelize/models/user.model';
import {
  IUsersServiceImplementation,
  UserDeleteResponse,
  UsersFindAllResponse,
} from 'src/users/users.types';
import { measureTime } from 'src/utils/utils.helpers';

@Injectable()
export class UsersSequelizeService implements IUsersServiceImplementation {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async getUsersDefault(): Promise<UsersFindAllResponse> {
    const result = measureTime(() => {
      return this.userModel.findAll({ limit: 100 });
    });
    await this.userModel.findAll({
      limit: 100,
      logging: (sql) => {
        console.log('Raw SQL:', sql);
      },
    });
    return result;
  }

  async getUsersRaw(): Promise<UsersFindAllResponse> {
    const result = measureTime(() => {
      return this.userModel.findAll({ limit: 100 });
    });
    await this.userModel.sequelize?.query(
      `SELECT "id", "email", "password_hash" AS "passwordHash", "full_name" AS "fullName", "created_at", "updatedAt" 
      FROM "user" AS "user" LIMIT 100`,
    );
    return result;
  }

  async deleteUserDefault(id: number): Promise<UserDeleteResponse> {
    return {
      data: { email: '', fullName: '', id: 0, passwordHash: '' },
      timeMs: 0,
    };
  }

  async deleteUserRaw(id: number): Promise<UserDeleteResponse> {
    return {
      data: { email: '', fullName: '', id: 0, passwordHash: '' },
      timeMs: 0,
    };
  }
}
