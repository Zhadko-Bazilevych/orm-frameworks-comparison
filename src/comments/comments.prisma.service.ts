import { Injectable } from '@nestjs/common';
import {
  Comment,
  ICommentsServiceImplementation,
} from 'src/comments/comments.types';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { measureTime } from 'src/utils/utils.helpers';

@Injectable()
export class CommentsPrismaService implements ICommentsServiceImplementation {
  constructor(private prisma: PrismaService) {}

  async getCommentTreeByIdDefault(id: number) {
    const result = await measureTime(async () => {
      const comment = await this.prisma.comment.findUnique({
        where: { id: Number(id) },
      });

      if (!comment) return null;

      const buildRecursively = async (parent: typeof comment): Promise<any> => {
        const children = await this.prisma.comment.findMany({
          where: { parentId: parent.id },
        });

        const childTrees = await Promise.all(
          children.map((child) => buildRecursively(child)),
        );

        return {
          ...parent,
          children: childTrees,
        };
      };

      return buildRecursively(comment);
    });

    return result;
  }

  async getCommentTreeByIdRaw(id: number) {
    return await measureTime(async () => {
      const rootResult = await this.prisma.$queryRawUnsafe<Comment[]>(
        `SELECT "public"."Comment"."id", "public"."Comment"."user_id", "public"."Comment"."product_id", "public"."Comment"."parent_id", "public"."Comment"."content", "public"."Comment"."created_at"
       FROM "public"."Comment"
       WHERE ("public"."Comment"."id" = $1 AND 1=1)
       LIMIT $2 OFFSET $3`,
        Number(id),
        1,
        0,
      );

      if (rootResult.length === 0) throw new Error('Root comment not found');
      const root = rootResult[0];

      const buildTree = async (comment: any): Promise<any> => {
        const children = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT "public"."Comment"."id", "public"."Comment"."user_id", "public"."Comment"."product_id", "public"."Comment"."parent_id", "public"."Comment"."content", "public"."Comment"."created_at"
         FROM "public"."Comment"
         WHERE "public"."Comment"."parent_id" = $1
         OFFSET $2`,
          comment.id,
          0,
        );

        const childTrees = await Promise.all(
          children.map((child) => buildTree(child)),
        );

        return {
          ...comment,
          children: childTrees,
        };
      };

      return await buildTree(root);
    });
  }
}
