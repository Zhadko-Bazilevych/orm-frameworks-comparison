import { Inject } from '@nestjs/common';
import { BaseService } from 'src/utils/utils.service';
import { ICommentsService } from 'src/comments/comments.types';
import { CommentsSequelizeService } from 'src/comments/comments.sequelize.service';
import { InterfaceToType } from 'src/utils/utils.types';

export class CommentsService extends BaseService<
  InterfaceToType<ICommentsService>
> {
  constructor(
    @Inject(CommentsSequelizeService)
    commentsSequelizeService: CommentsSequelizeService,
    // @Inject(CommentTypeOrmService)
    // commentTypeOrmService: CommentTypeOrmService,
  ) {
    super(commentsSequelizeService);
  }
}
