import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { IUsersServiceImplementation, User } from 'src/users/users.types';
import { measureTime } from 'src/utils/utils.helpers';

@Injectable()
export class UsersPrismaService implements IUsersServiceImplementation {
  constructor(private prisma: PrismaService) {}

  async getUsersDefault(limit: number) {
    return {
      data: await this.prisma.user.findMany({
        orderBy: {
          id: 'desc',
        },
        take: Number(limit),
        select: {
          id: true,
        },
      }),
    };
  }

  async getUserDefault(id: number) {
    const result = measureTime(() => {
      return this.prisma.user.findUnique({
        where: {
          id: Number(id),
        },
      });
    });
    return result;
  }

  async getUserRaw(id: number) {
    const result = await measureTime(async () => {
      const userList = await this.prisma.$queryRaw`
  SELECT "public"."User"."id", "public"."User"."email", "public"."User"."password_hash", "public"."User"."full_name", "public"."User"."created_at" FROM "public"."User" WHERE ("public"."User"."id" = ${Number(id)} AND 1=1) LIMIT 1 OFFSET 0`;
      return userList;
    });
    return result;
  }

  async getUserExplain(id: number) {
    const result = await measureTime(async () => {
      const explain = await this.prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE)
      SELECT "public"."User"."id", "public"."User"."email", "public"."User"."password_hash", "public"."User"."full_name", "public"."User"."created_at" FROM "public"."User" WHERE ("public"."User"."id" = ${Number(id)} AND 1=1) LIMIT 1 OFFSET 0`);
      return explain;
    });
    return result;
  }

  async deleteUserDefault(id: number) {
    const result = measureTime(async () => {
      const deletedUser = (await this.prisma.user.delete({
        where: { id: Number(id) },
      })) as User;
      return !!deletedUser;
    });
    return result;
  }

  async deleteUserRaw(id: number) {
    const numericId = Number(id);

    const result = await measureTime(async () => {
      const [deletedUser] = await this.prisma.$queryRaw<[User]>`
        DELETE FROM "public"."User"
        WHERE ("public"."User"."id" = ${numericId} AND 1=1)
        RETURNING "public"."User"."id",
                  "public"."User"."email",
                  "public"."User"."password_hash",
                  "public"."User"."full_name",
                  "public"."User"."created_at"
      `;
      return !!deletedUser;
    });

    return result;
  }

  async deleteUserExplain(id: number) {
    const numericId = Number(id);

    const result = await measureTime(async () => {
      const explain = await this.prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE)
      DELETE FROM "public"."User"
      WHERE ("public"."User"."id" = ${numericId} AND 1=1)
      RETURNING "public"."User"."id",
                "public"."User"."email",
                "public"."User"."password_hash",
                "public"."User"."full_name",
                "public"."User"."created_at"
    `);
      return explain;
    });

    return result;
  }

  async createUserDefault(user: User) {
    const result = measureTime(() => {
      return this.prisma.user.create({
        data: user,
      });
    });
    return result;
  }

  async createUserRaw(user: User) {
    const result = await measureTime(async () => {
      const [createdUser] = await this.prisma.$queryRaw<[User]>`
      INSERT INTO "public"."User" ("email", "password_hash", "full_name")
      VALUES (${user.email}, ${user.passwordHash}, ${user.fullName})
      RETURNING "public"."User"."id", "public"."User"."email", 
                "public"."User"."password_hash", "public"."User"."full_name", 
                "public"."User"."created_at"
    `;
      return createdUser;
    });
    return result;
  }

  async createUserExplain(user: User) {
    const result = await measureTime(async () => {
      const explain = await this.prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE)
      INSERT INTO "public"."User" ("email", "password_hash", "full_name")
      VALUES ('${user.email}', '${user.passwordHash}', '${user.fullName}')
      RETURNING "public"."User"."id", "public"."User"."email", 
                "public"."User"."password_hash", "public"."User"."full_name", 
                "public"."User"."created_at"
    `);
      return explain;
    });
    return result;
  }

  async updateUserDefault(user: User) {
    const result = measureTime(() => {
      return this.prisma.user.update({
        where: { id: user.id },
        data: user,
      });
    });
    return result;
  }

  async updateUserRaw(user: User) {
    const result = await measureTime(async () => {
      const [updatedUser] = await this.prisma.$queryRaw<[User]>`
      UPDATE "public"."User"
      SET "id" = ${user.id}, 
          "email" = ${user.email}, 
          "password_hash" = ${user.passwordHash}, 
          "full_name" = ${user.fullName}
      WHERE ("public"."User"."id" = ${user.id} AND 1=1)
      RETURNING "public"."User"."id", 
                "public"."User"."email", 
                "public"."User"."password_hash", 
                "public"."User"."full_name", 
                "public"."User"."created_at"
    `;
      return updatedUser;
    });
    return result;
  }

  async updateUserExplain(user: User) {
    const result = await measureTime(async () => {
      const explain = await this.prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE)
      UPDATE "public"."User"
      SET "id" = ${user.id}, 
          "email" = '${user.email}', 
          "password_hash" = '${user.passwordHash}', 
          "full_name" = '${user.fullName}'
      WHERE ("public"."User"."id" = ${user.id} AND 1=1)
      RETURNING "public"."User"."id", 
                "public"."User"."email", 
                "public"."User"."password_hash", 
                "public"."User"."full_name", 
                "public"."User"."created_at"
    `);
      return explain;
    });
    return result;
  }
}
