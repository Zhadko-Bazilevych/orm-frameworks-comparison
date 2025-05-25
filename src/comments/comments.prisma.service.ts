import { Injectable } from '@nestjs/common';
import {
  Comment,
  ICommentsServiceImplementation,
} from 'src/comments/comments.types';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { measureTime, sumExplainTimes } from 'src/utils/utils.helpers';

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

  // async getCommentTreeByIdRaw(id: number) {
  //   return await measureTime(async () => {
  //     const flatComments = await this.getFlatCommentTree(id);
  //     const commentTree = this.flatTreeToTree(flatComments);
  //     return commentTree;
  //   });
  // }

  // async getFlatCommentTree(id: number): Promise<DimonComment[]> {
  //   return await this.prisma.$queryRaw<DimonComment[]>`\
  //   with recursive tree as (
  //     select
  //       id,
  //       parent_id "parentId",
  //       content,
  //       created_at "createdAt"
  //     from
  //       "Comment"
  //     where
  //       parent_id = ${Number(id)}
  //     union all
  //     select
  //       c.id,
  //       c.parent_id "parentId",
  //       c.content,
  //       c.created_at "createdAt"
  //     from
  //       "Comment" c
  //     join tree on tree.id = c.parent_id
  //   )
  //   select * from tree;`;
  // }

  // flatTreeToTree(flatComments: DimonComment[]): DimonCommentTree[] {
  //   const commentTree: DimonCommentTree[] = [];
  //   const idToChildrenMap: Record<number, DimonCommentTree[]> = {};

  //   for (let i = 0; i < flatComments.length; i++) {
  //     const comment = flatComments[i];
  //     if (!comment.parentId || !idToChildrenMap[comment.parentId]) {
  //       const children: DimonCommentTree[] = [];
  //       commentTree.push({ ...comment, children });
  //       idToChildrenMap[comment.id] = children;
  //       continue;
  //     }

  //     const parentReplies = idToChildrenMap[comment.parentId];
  //     const children: DimonCommentTree[] = [];
  //     parentReplies.push({ ...comment, children });
  //     idToChildrenMap[comment.id] = children;
  //   }

  //   return commentTree;
  // }

  async getCommentTreeByIdExplain(id: number) {
    return measureTime(async () => {
      const explains: { 'QUERY PLAN': string }[][] = [];

      const rootExplain = await this.prisma.$queryRawUnsafe<
        { 'QUERY PLAN': string }[]
      >(
        `EXPLAIN (ANALYZE)
       SELECT "public"."Comment"."id", "public"."Comment"."user_id", "public"."Comment"."product_id", "public"."Comment"."parent_id", "public"."Comment"."content", "public"."Comment"."created_at"
       FROM "public"."Comment"
       WHERE ("public"."Comment"."id" = $1 AND 1=1)
       LIMIT $2 OFFSET $3`,
        Number(id),
        1,
        0,
      );
      explains.push(rootExplain);

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

      const buildTree = async (comment: any): Promise<unknown> => {
        const explainChildren = await this.prisma.$queryRawUnsafe<
          { 'QUERY PLAN': string }[]
        >(
          `EXPLAIN (ANALYZE)
         SELECT "public"."Comment"."id", "public"."Comment"."user_id", "public"."Comment"."product_id", "public"."Comment"."parent_id", "public"."Comment"."content", "public"."Comment"."created_at"
         FROM "public"."Comment"
         WHERE "public"."Comment"."parent_id" = $1
         OFFSET $2`,
          comment.id,
          0,
        );
        explains.push(explainChildren);

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

      await buildTree(root);
      const summedExplain = sumExplainTimes(...explains);
      return summedExplain;
    });
  }
}
