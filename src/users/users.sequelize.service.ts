import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Optional } from 'sequelize';
import { User as UserModel } from 'src/db/sequelize/models/user.model';
import { IUsersServiceImplementation, User } from 'src/users/users.types';
import { measureTime } from 'src/utils/utils.helpers';

@Injectable()
export class UsersSequelizeService implements IUsersServiceImplementation {
  constructor(@InjectModel(UserModel) private userModel: typeof UserModel) {}

  async getUsersDefault() {
    const result = measureTime(() => {
      return this.userModel.findAll({ limit: 100 });
    });
    return result;
  }

  async getUsersRaw() {
    const result = measureTime(async () => {
      const [userList] = (await this.userModel.sequelize!.query(
        `SELECT "id", "email", "password_hash" AS "passwordHash", "full_name" AS "fullName", "created_at", "updatedAt" 
        FROM "user" AS "user" LIMIT 100`,
      )) as [User[], number];
      return userList;
    });
    return result;
  }

  async deleteUserDefault(id: number) {
    const result = measureTime(async () => {
      const deletedCount = await this.userModel.destroy({ where: { id: id } });
      return !!deletedCount;
    });
    return result;
  }

  async deleteUserRaw(id: number) {
    const result = measureTime(async () => {
      const [deletedCount] = await this.userModel.sequelize!.query(
        `DELETE FROM "user" WHERE "id" = ${id}`,
      );
      return !!deletedCount;
    });
    return result;
  }

  async createUserDefault(user: Optional<User, 'id'>) {
    const result = measureTime(() => {
      return this.userModel.create(user);
    });
    return result;
  }

  async createUserRaw(user: Optional<User, 'id'>) {
    const result = measureTime(async () => {
      const [[newUser]] = (await this.userModel.sequelize!.query(
        `INSERT INTO "user" ("id", "email", "password_hash", "full_name", "created_at", "updatedAt")
         VALUES (DEFAULT, $1, $2, $3, $4, $5)
         RETURNING "id", "email", "password_hash", "full_name", "created_at", "updatedAt";`,
        {
          bind: [
            user.email,
            user.passwordHash,
            user.fullName,
            new Date(),
            new Date(),
          ],
        },
      )) as [User[], unknown];
      return newUser;
    });
    return result;
  }

  async updateUserDefault(user: User) {
    const result = measureTime(async () => {
      const [, [affectedUser]] = await this.userModel.update(user, {
        where: { id: user.id },
        returning: true,
      });
      return affectedUser;
    });
    return result;
  }

  async updateUserRaw(user: User) {
    const result = measureTime(async () => {
      const [[updatedUser]] = (await this.userModel.sequelize!.query(
        `UPDATE "user" SET "id"=$1,"email"=$2,"password_hash"=$3,"full_name"=$4,"updatedAt"=$5 WHERE "id" = $6 RETURNING "id","email","password_hash","full_name","created_at","updatedAt"`,
        {
          bind: [
            user.id,
            user.email,
            user.passwordHash,
            user.fullName,
            new Date(),
            user.id,
          ],
        },
      )) as [User[], unknown];
      return updatedUser;
    });

    return result;
  }
}
