import { Inject, Injectable } from '@nestjs/common';
import { User as UserEntity } from 'src/db/typeorm/models/user.model';
import { Repository } from 'typeorm';
import { measureTime } from 'src/utils/utils.helpers';
import { IUsersServiceImplementation, User } from 'src/users/users.types';

@Injectable()
export class UsersTypeOrmService implements IUsersServiceImplementation {
  constructor(
    @Inject('USER_REPOSITORY_TYPEORM')
    private userRepository: Repository<UserEntity>,
  ) {}

  async getUsersDefault() {
    const result = await measureTime(async () => {
      return this.userRepository.find({
        take: 100,
      });
    });

    return result;
  }

  async getUsersRaw() {
    const dataSource = this.userRepository.manager.connection;
    const result = await measureTime(async () => {
      return dataSource.query(
        `SELECT "User"."id" AS "User_id",
            "User"."email" AS "User_email",
            "User"."password_hash" AS "User_password_hash",
            "User"."full_name" AS "User_full_name",
            "User"."created_at" AS "User_created_at"
     FROM "User" "User"
     LIMIT 100`,
      );
    });

    return result;
  }

  async getUsersExplain() {
    const dataSource = this.userRepository.manager.connection;
    const result = await measureTime(async () => {
      return dataSource.query(`
      EXPLAIN (ANALYZE)
      SELECT "User"."id" AS "User_id",
             "User"."email" AS "User_email",
             "User"."password_hash" AS "User_password_hash",
             "User"."full_name" AS "User_full_name",
             "User"."created_at" AS "User_created_at"
      FROM "User" "User"
      LIMIT 100
    `);
    });
    return result;
  }

  async deleteUserDefault(id: number) {
    const result = measureTime(async () => {
      const deleteResult = await this.userRepository.delete(id);
      return !!deleteResult.affected;
    });
    return result;
  }

  async deleteUserRaw(id: number) {
    const dataSource = this.userRepository.manager.connection;
    const result = await measureTime(async () => {
      const response: [[], number] = await dataSource.query(
        `DELETE FROM "User" WHERE "id" IN ($1)`,
        [`${id}`],
      );
      return !!response;
    });

    return result;
  }

  async deleteUserExplain(id: number) {
    const dataSource = this.userRepository.manager.connection;
    const result = await measureTime(async () => {
      const explain: unknown = await dataSource.query(
        `EXPLAIN (ANALYZE) DELETE FROM "User" WHERE "id" IN ($1)`,
        [id],
      );
      return explain;
    });

    return result;
  }

  async createUserDefault(user: User) {
    const result = measureTime(async () => {
      const newUser = this.userRepository.create(user);
      const savedUser = await this.userRepository.save(newUser);
      return savedUser;
    });
    return result;
  }

  async createUserRaw(user: User) {
    const dataSource = this.userRepository.manager.connection;
    const result = await measureTime(async () => {
      const response: User = await dataSource.query(
        `INSERT INTO "User"("email", "password_hash", "full_name", "created_at") VALUES ($1, $2, $3, DEFAULT) RETURNING "id"`,
        [user.email, user.passwordHash, user.fullName],
      );
      return response;
    });

    return result;
  }

  async createUserExplain(user: User) {
    const dataSource = this.userRepository.manager.connection;

    const explainResult = await measureTime(async () => {
      const explain: unknown = await dataSource.query(
        `EXPLAIN (ANALYZE)
       INSERT INTO "User" ("email", "password_hash", "full_name", "created_at")
       VALUES ($1, $2, $3, DEFAULT)
       RETURNING "id"`,
        [user.email, user.passwordHash, user.fullName],
      );
      return explain;
    });

    await dataSource.query(
      `INSERT INTO "User" ("email", "password_hash", "full_name", "created_at")
       VALUES ($1, $2, $3, DEFAULT)
       RETURNING "id", "email", "password_hash", "full_name", "created_at"`,
      [user.email, user.passwordHash, user.fullName],
    );

    return explainResult;
  }

  async updateUserDefault(user: User) {
    const result = await measureTime(async () => {
      await this.userRepository.update(user.id!, user);
      const updatedUser = await this.userRepository.findOne({
        where: { id: user.id },
      });
      return updatedUser!;
    });

    return result;
  }

  async updateUserRaw(user: User) {
    const dataSource = this.userRepository.manager.connection;
    const result = await measureTime(async () => {
      const response: User = await dataSource.query(
        `UPDATE "User" SET "id" = $1, "email" = $2, "password_hash" = $3, "full_name" = $4 WHERE "id" IN ($5)`,
        [user.id, user.email, user.passwordHash, user.fullName, user.id],
      );
      return response;
    });

    return result;
  }

  async updateUserExplain(user: User) {
    const dataSource = this.userRepository.manager.connection;
    const result = await measureTime(async () => {
      const explain: unknown = await dataSource.query(
        `EXPLAIN (ANALYZE)
       UPDATE "User"
       SET "id" = $1, "email" = $2, "password_hash" = $3, "full_name" = $4
       WHERE "id" IN ($5)`,
        [user.id, user.email, user.passwordHash, user.fullName, user.id],
      );
      return explain;
    });

    return result;
  }
}
