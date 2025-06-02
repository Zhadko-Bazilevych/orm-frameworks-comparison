import { Body, Controller, Get, Query } from '@nestjs/common';
import { CommentsService } from 'src/comments/comments.service';
import { Comment } from 'src/comments/comments.types';
import { BaseResponse, ORM, QueryType } from 'src/utils/utils.types';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async getCommentTreeById(
    @Query('commentId') commentId: string,
    @Query('orm') orm: ORM,
    @Query('queryType') queryType: QueryType,
  ): Promise<BaseResponse<Comment>> {
    return await this.commentsService.call(
      orm,
      'getCommentTreeById',
      queryType,
      [Number(commentId)],
    );
  }
}
