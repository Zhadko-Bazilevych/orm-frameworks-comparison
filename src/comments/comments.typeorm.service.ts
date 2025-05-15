import { Inject, Injectable } from '@nestjs/common';
import {
  Comment,
  ICommentsServiceImplementation,
} from 'src/comments/comments.types';
import { measureTime } from 'src/utils/utils.helpers';
import { Comment as CommentEntity } from 'src/db/typeorm/models/comment.model';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsTypeOrmService implements ICommentsServiceImplementation {
  constructor(
    @Inject('COMMENT_REPOSITORY_TYPEORM')
    private commentRepository: Repository<CommentEntity>,
  ) {}

  async getCommentTreeByIdDefault(id: number) {
    const result = await measureTime(async () => {
      const comment = await this.commentRepository.findOne({
        where: { id },
      });

      if (!comment) return null;

      const buildRecursively = async (parent: CommentEntity): Promise<any> => {
        const children = await this.commentRepository.find({
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

      return await buildRecursively(comment);
    });

    return result;
  }

  async getCommentTreeByIdRaw(id: number) {
    const dataSource = this.commentRepository.manager.connection;

    const result = await measureTime(async () => {
      const rootRows = (await dataSource.query(
        `
      SELECT "Comment"."id" AS "Comment_id",
             "Comment"."user_id" AS "Comment_user_id",
             "Comment"."product_id" AS "Comment_product_id",
             "Comment"."parent_id" AS "Comment_parent_id",
             "Comment"."content" AS "Comment_content",
             "Comment"."created_at" AS "Comment_created_at",
             "Comment"."parentId" AS "Comment_parentId"
      FROM "Comment" "Comment"
      WHERE (("Comment"."id" = $1))
      LIMIT 1
      `,
        [id],
      )) as Comment[];

      const root = rootRows[0];
      if (!root) throw new Error('Comment not found');

      const buildRecursively = async (parent: any): Promise<any> => {
        const children = (await dataSource.query(
          `
        SELECT "Comment"."id" AS "Comment_id",
               "Comment"."user_id" AS "Comment_user_id",
               "Comment"."product_id" AS "Comment_product_id",
               "Comment"."parent_id" AS "Comment_parent_id",
               "Comment"."content" AS "Comment_content",
               "Comment"."created_at" AS "Comment_created_at",
               "Comment"."parentId" AS "Comment_parentId"
        FROM "Comment" "Comment"
        WHERE (("Comment"."parent_id" = $1))
        `,
          [parent.Comment_id],
        )) as Comment[];

        const childrenWithSub = await Promise.all(
          children.map((child) => buildRecursively(child)),
        );

        return {
          ...parent,
          children: childrenWithSub,
        };
      };

      return await buildRecursively(root);
    });

    return result;
  }
}
