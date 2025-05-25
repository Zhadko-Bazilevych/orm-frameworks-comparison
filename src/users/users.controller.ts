import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { BaseResponse, ORM, QueryType } from 'src/utils/utils.types';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('orm') orm: ORM,
    @Query('queryType') queryType: QueryType,
  ) {
    return await this.usersService.call(orm, 'getUsers', queryType, []);
  }

  @Delete()
  async deleteUser(
    @Query('id') id: number,
    @Query('orm') orm: ORM,
    @Query('queryType') queryType: QueryType,
  ): Promise<BaseResponse<unknown>> {
    return await this.usersService.call(orm, 'deleteUser', queryType, [id]);
  }

  @Post()
  async createUser(
    @Body()
    userData: { email: string; password: string; fullName: string },
    @Query('orm') orm: ORM,
    @Query('queryType') queryType: QueryType,
  ): Promise<BaseResponse<unknown>> {
    const hashedPassword = (await bcrypt.hash(userData.password, 10)) as string;
    const newUser = {
      email: userData.email,
      passwordHash: hashedPassword,
      fullName: userData.fullName,
    };
    const result = await this.usersService.call(orm, 'createUser', queryType, [
      newUser,
    ]);
    return result;
  }

  @Put()
  async updateUser(
    @Body()
    userData: { id: number; email: string; password: string; fullName: string },
    @Query('orm') orm: ORM,
    @Query('queryType') queryType: QueryType,
  ): Promise<BaseResponse<unknown>> {
    const hashedPassword = (await bcrypt.hash(userData.password, 10)) as string;
    const updatedUser = {
      id: userData.id,
      email: userData.email,
      passwordHash: hashedPassword,
      fullName: userData.fullName,
    };

    const result = await this.usersService.call(orm, 'updateUser', queryType, [
      updatedUser,
    ]);

    return result;
  }
}
