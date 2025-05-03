import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UsersFindAllResponse } from 'src/users/users.types';
import { ORM, QueryType } from 'src/utils/utils.types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Query('orm') orm: ORM,
    @Query('queryType') queryType: QueryType,
  ): Promise<UsersFindAllResponse> {
    return this.usersService.call(orm, 'getUsers', queryType, []);
  }
}
