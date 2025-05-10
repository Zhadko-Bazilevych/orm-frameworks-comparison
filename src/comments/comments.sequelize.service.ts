import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Comment as CommentModel } from 'src/db/sequelize/models/comment.model';
import {
  Comment,
  ICommentsServiceImplementation,
} from 'src/comments/comments.types';
import { measureTime } from 'src/utils/utils.helpers';
import { User } from 'src/db/sequelize/models/user.model';

@Injectable()
export class CommentsSequelizeService
  implements ICommentsServiceImplementation
{
  constructor(
    @InjectModel(CommentModel) private commentModel: typeof CommentModel,
  ) {}

  async getCommentTreeByIdDefault(id: number) {
    const result = await measureTime(async () => {
      const comment = await this.commentModel.findByPk(id, {
        logging: console.log,
      });
      if (!comment) return null;

      const buildRecursively = async (parent: CommentModel): Promise<any> => {
        const children = await this.commentModel.findAll({
          where: { parentId: parent.id },
          include: [
            {
              model: User,
              as: 'user',
            },
          ],
          logging: console.log,
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
      SELECT "comment"."id", "comment"."user_id" AS "userId", 
             "comment"."product_id" AS "productId", 
             "comment"."parent_id" AS "parentId", 
             "comment"."content", 
             "comment"."created_at" AS "createdAt"
      FROM "Comment" AS "comment"
      WHERE "comment"."id" = '${id}'
      `,
      );

      const root = commentRows[0];
      if (!root) return null;

      const buildRecursively = async (parent: any): Promise<any> => {
        const [children] = await this.commentModel.sequelize!.query(
          `
        SELECT "comment"."id", "comment"."user_id" AS "userId", 
               "comment"."product_id" AS "productId", 
               "comment"."parent_id" AS "parentId", 
               "comment"."content", 
               "comment"."created_at" AS "createdAt", 
               "user"."id" AS "user.id", 
               "user"."email" AS "user.email", 
               "user"."password_hash" AS "user.passwordHash", 
               "user"."full_name" AS "user.fullName", 
               "user"."createdAt" AS "user.createdAt", 
               "user"."updatedAt" AS "user.updatedAt"
        FROM "Comment" AS "comment"
        LEFT OUTER JOIN "User" AS "user" ON "comment"."user_id" = "user"."id"
        WHERE "comment"."parent_id" = ${parent.id}
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
