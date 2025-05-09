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
      const comment = await this.commentModel.findByPk(id);
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
    return await this.getCommentTreeByIdDefault(id);
  }

  // async getCommentsRaw(filterData: CommentRequestBody) {
  //   const offset = (filterData.page - 1) * filterData.pageSize;
  //   const result = measureTime(async () => {
  //     const [updatedUser] = (await this.commentModel.sequelize!.query(
  //       `SELECT "id", "name", "description", "price", "stock", "category_id" AS "categoryId", "last_updated" AS "lastUpdated" FROM "Comment" AS "comment" WHERE "comment"."category_id" = '${filterData.categoryId}' ORDER BY "comment"."name" ASC LIMIT '${filterData.pageSize}' OFFSET ${offset};`,
  //     )) as [Comment[], unknown];
  //     return updatedUser;
  //   });

  //   return result;
  // }
}
