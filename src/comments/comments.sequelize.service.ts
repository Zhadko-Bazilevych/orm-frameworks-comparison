import { Inject, Injectable } from '@nestjs/common';
import { Comment as CommentModel } from 'src/db/sequelize/models/comment.model';
import {
  Comment,
  ICommentsServiceImplementation,
} from 'src/comments/comments.types';
import { measureTime } from 'src/utils/utils.helpers';

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
AS "comment" WHERE "comment"."parent_id" = '${id}'
      `,
      );

      const root = commentRows[0];
      if (!root) return null;

      const buildRecursively = async (parent: any): Promise<any> => {
        const [children] = await this.commentModel.sequelize!.query(
          `
        SELECT "id", "user_id" AS "userId", "product_id" AS "productId", "parent_id" AS "parentId", "content", "created_at" AS "createdAt" FROM "Comment" 
AS "comment" WHERE "comment"."parent_id" = ${parent.id}
        `,
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
}
