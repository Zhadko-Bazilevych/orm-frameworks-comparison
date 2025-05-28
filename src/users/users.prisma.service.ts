import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Optional } from 'sequelize';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { IUsersServiceImplementation, User } from 'src/users/users.types';
import { measureTime } from 'src/utils/utils.helpers';

@Injectable()
export class UsersPrismaService implements IUsersServiceImplementation {
  constructor(private prisma: PrismaService) {}

  async getUsersDefault(limit: number) {
    return this.prisma.user.findMany({
      orderBy: {
        id: 'desc',
      },
      take: Number(limit),
      select: {
        id: true,
      },
    });
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

  async getUserRaw() {
    const result = await measureTime(async () => {
      const userList = await this.prisma.$queryRaw`
  SELECT "public"."User"."id", "public"."User"."email", "public"."User"."password_hash", 
         "public"."User"."full_name", "public"."User"."created_at"
  FROM "public"."User"
  WHERE 1=1
  ORDER BY "public"."User"."id" ASC
  LIMIT ${100} OFFSET ${0}
`;

      return userList;
    });
    return result;
  }

  async getUserExplain() {
    const result = await measureTime(async () => {
      const explain = await this.prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE)
      SELECT "public"."User"."id", "public"."User"."email", "public"."User"."password_hash", 
             "public"."User"."full_name", "public"."User"."created_at"
      FROM "public"."User"
      WHERE 1=1
      ORDER BY "public"."User"."id" ASC
      LIMIT 100 OFFSET 0
    `);
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

  async deleteUserRaw(id: number | string) {
    const numericId = Number(id);

    const result = await measureTime(async () => {
      const [deletedUser] = await this.prisma.$queryRaw<[User]>(
        Prisma.sql`
        DELETE FROM "public"."User"
        WHERE ("public"."User"."id" = ${numericId} AND 1=1)
        RETURNING "public"."User"."id",
                  "public"."User"."email",
                  "public"."User"."password_hash",
                  "public"."User"."full_name",
                  "public"."User"."created_at"
      `,
      );
      return !!deletedUser;
    });

    return result;
  }

  async deleteUserExplain(id: number | string) {
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

  async createUserDefault(user: Optional<User, 'id'>) {
    const result = measureTime(() => {
      return this.prisma.user.create({
        data: user,
      });
    });
    return result;
  }

  async createUserRaw(user: Optional<User, 'id'>) {
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

  async createUserExplain(user: Optional<User, 'id'>) {
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
