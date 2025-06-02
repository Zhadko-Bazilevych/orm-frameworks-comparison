import { Inject, Injectable } from '@nestjs/common';
import { Comment as CommentModel } from 'src/db/sequelize/models/comment.model';
import {
  Comment,
  ICommentsServiceImplementation,
} from 'src/comments/comments.types';
import { measureTime, sumExplainTimes } from 'src/utils/utils.helpers';

@Injectable()
export class CommentsSequelizeService
  implements ICommentsServiceImplementation
{
  constructor(
    @Inject('COMMENT_MODEL_SEQUELIZE')
    private commentModel: typeof CommentModel,
  ) {}

  async getCommentTreeByIdDefault(id: number) {
    const result = await measureTime(async () => {
      const comment = await this.commentModel.findByPk(id, {});
      if (!comment) return null;

      const buildRecursively = async (parent: CommentModel): Promise<any> => {
        const children = await this.commentModel.findAll({
          where: { parentId: parent.id },
        });

        const childTrees = await Promise.all(
          children.map((child) => buildRecursively(child)),
        );

        return {
          ...parent.get(),
          children: childTrees,
        };
      };

      return buildRecursively(comment);
    });

    return result;
  }

  async getCommentTreeByIdRaw(id: number) {
    const result = await measureTime(async () => {
      const [commentRows] = await this.commentModel.sequelize!.query(
        `
     SELECT "id", "user_id" AS "userId", "product_id" AS "productId", "parent_id" AS "parentId", "content", "created_at" AS "createdAt" FROM "Comment" 
AS "comment" WHERE "comment"."parent_id" = $1`,
        {
          bind: [id],
        },
      );

      const root = commentRows[0];
      if (!root) return null;

      const buildRecursively = async (parent: any): Promise<any> => {
        const [children] = await this.commentModel.sequelize!.query(
          `
        SELECT "id", "user_id" AS "userId", "product_id" AS "productId", "parent_id" AS "parentId", "content", "created_at" AS "createdAt" FROM "Comment" 
AS "comment" WHERE "comment"."parent_id" = $1`,
          {
            bind: [parent.id],
          },
        );

        const childrenWithSub = await Promise.all(
          children.map((child: any) => buildRecursively(child)),
        );

        return {
          ...parent,
          children: childrenWithSub,
        };
      };

      return buildRecursively(root);
    });

    return result;
  }

  async getCommentTreeByIdExplain(id: number) {
    return measureTime(async () => {
      const explains: { 'QUERY PLAN': string }[][] = [];

      const [rootExplainRaw] = (await this.commentModel.sequelize!.query(
        `
      EXPLAIN (ANALYZE)
      SELECT "id", "user_id" AS "userId", "product_id" AS "productId", "parent_id" AS "parentId", "content", "created_at" AS "createdAt" 
      FROM "Comment" AS "comment" WHERE "comment"."parent_id" = $1`,
        {
          bind: [id],
        },
      )) as [unknown[], unknown];
      explains.push(rootExplainRaw as { 'QUERY PLAN': string }[]);

      const [commentRows] = await this.commentModel.sequelize!.query(
        `
      SELECT "id", "user_id" AS "userId", "product_id" AS "productId", "parent_id" AS "parentId", "content", "created_at" AS "createdAt" 
      FROM "Comment" AS "comment" WHERE "comment"."parent_id" = $1`,
        {
          bind: [id],
        },
      );

      const root = (commentRows as unknown[])[0];
      if (!root) return null;

      const buildRecursively = async (parent: any): Promise<any> => {
        const [explainRaw] = (await this.commentModel.sequelize!.query(
          `
        EXPLAIN (ANALYZE)
        SELECT "id", "user_id" AS "userId", "product_id" AS "productId", "parent_id" AS "parentId", "content", "created_at" AS "createdAt" 
        FROM "Comment" AS "comment" WHERE "comment"."parent_id" = $1`,
          {
            bind: [parent.id],
          },
        )) as [unknown[], unknown];
        explains.push(explainRaw as { 'QUERY PLAN': string }[]);

        const [children] = await this.commentModel.sequelize!.query(
          `
        SELECT "id", "user_id" AS "userId", "product_id" AS "productId", "parent_id" AS "parentId", "content", "created_at" AS "createdAt" 
        FROM "Comment" AS "comment" WHERE "comment"."parent_id" = $1`,
          {
            bind: [parent.id],
          },
        );

        const childrenWithSub = await Promise.all(
          (children as any[]).map((child) => buildRecursively(child)),
        );

        return {
          ...parent,
          children: childrenWithSub,
        };
      };

      await buildRecursively(root);
      return sumExplainTimes(...explains);
    });
  }
}
