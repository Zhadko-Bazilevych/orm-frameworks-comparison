import { Inject, Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/sequelize';
import { Optional } from 'sequelize';
import { User as UserModel } from 'src/db/sequelize/models/user.model';
import { IUsersServiceImplementation, User } from 'src/users/users.types';
import { measureTime } from 'src/utils/utils.helpers';

@Injectable()
export class UsersSequelizeService implements IUsersServiceImplementation {
  constructor(
    @Inject('USER_MODEL_SEQUELIZE') private userModel: typeof UserModel,
  ) {}

  async getUserDefault(id: number) {
    const result = measureTime(() => {
      return this.userModel.findByPk(id);
    });
    return result;
  }

  async getUserRaw(id: number) {
    const result = measureTime(async () => {
      const [userList] = (await this.userModel.sequelize!.query(
        `SELECT "id", "email", "password_hash" AS "passwordHash", "full_name" AS "fullName", "created_at" 
        FROM "User" AS "user" WHERE "user"."id" = $1;`,
        {
          bind: [id],
        },
      )) as [User[], number];
      return userList;
    });
    return result;
  }

  async getUserExplain(id: number) {
    const result = measureTime(async () => {
      const [explain] = await this.userModel.sequelize!.query(
        `EXPLAIN (ANAlYZE) 
        SELECT "id", "email", "password_hash" AS "passwordHash", "full_name" AS "fullName", "created_at" 
        FROM "User" AS "user" WHERE "user"."id" = $1;`,
        {
          bind: [id],
        },
      );
      return explain;
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
    const sequelize = this.userModel.sequelize!;

    const result = measureTime(async () => {
      const [deletedCount] = await sequelize.query(
        `DELETE FROM "User" WHERE "id" = $1`,
        {
          bind: [id],
        },
      );
      return !!deletedCount;
    });
    return result;
  }

  async deleteUserExplain(id: number) {
    const result = measureTime(async () => {
      const [explain] = await this.userModel.sequelize!.query(
        `EXPLAIN (ANALYZE) DELETE FROM "User" WHERE "id" = $1`,
        {
          bind: [id],
        },
      );
      return explain;
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
    const curentDate = new Date();
    const result = measureTime(async () => {
      const [[newUser]] = (await this.userModel.sequelize!.query(
        `INSERT INTO "User" ("id", "email", "password_hash", "full_name", "created_at")
         VALUES (DEFAULT, $1, $2, $3, $4)
         RETURNING "id", "email", "password_hash", "full_name", "created_at";`,
        {
          bind: [user.email, user.passwordHash, user.fullName, curentDate],
        },
      )) as [User[], unknown];
      return newUser;
    });
    return result;
  }

  async createUserExplain(user: Optional<User, 'id'>) {
    const explainResult = await measureTime(async () => {
      const [explain] = await this.userModel.sequelize!.query(
        `EXPLAIN (ANALYZE)
       INSERT INTO "User" ("id", "email", "password_hash", "full_name", "created_at")
       VALUES (DEFAULT, $1, $2, $3, $4)
       RETURNING "id", "email", "password_hash", "full_name", "created_at";`,
        {
          bind: [user.email, user.passwordHash, user.fullName, new Date()],
        },
      );
      return explain;
    });

    return explainResult;
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
        `UPDATE "User" SET "id"=$1,"email"=$2,"password_hash"=$3,"full_name"=$4 WHERE "id" = $5 RETURNING "id","email","password_hash","full_name","created_at"`,
        {
          bind: [
            user.id,
            user.email,
            user.passwordHash,
            user.fullName,
            user.id,
          ],
        },
      )) as [User[], unknown];
      return updatedUser;
    });

    return result;
  }

  async updateUserExplain(user: User) {
    const result = measureTime(async () => {
      const [explain] = await this.userModel.sequelize!.query(
        `EXPLAIN (ANALYZE) UPDATE "User"
       SET "id" = $1, "email" = $2, "password_hash" = $3, "full_name" = $4
       WHERE "id" = $5
       RETURNING "id", "email", "password_hash", "full_name", "created_at"`,
        {
          bind: [
            user.id,
            user.email,
            user.passwordHash,
            user.fullName,
            user.id,
          ],
        },
      );
      return explain;
    });

    return result;
  }
}
