import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { BaseResponse, ORM, QueryType } from 'src/utils/utils.types';
import * as bcrypt from 'bcrypt';
import { UsersPrismaService } from 'src/users/users.prisma.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userPrismaService: UsersPrismaService,
  ) {}

  @Get()
  async findAll(@Query('limit') limit: string) {
    return await this.userPrismaService.getUsersDefault(Number(limit));
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Query('orm') orm: ORM,
    @Query('queryType') queryType: QueryType,
  ) {
    return await this.usersService.call(orm, 'getUser', queryType, [
      Number(id),
    ]);
  }

  @Delete()
  async deleteUser(
    @Query('id') id: string,
    @Query('orm') orm: ORM,
    @Query('queryType') queryType: QueryType,
  ): Promise<BaseResponse<unknown>> {
    return await this.usersService.call(orm, 'deleteUser', queryType, [
      Number(id),
    ]);
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
    userData: { id: string; email: string; password: string; fullName: string },
    @Query('orm') orm: ORM,
    @Query('queryType') queryType: QueryType,
  ): Promise<BaseResponse<unknown>> {
    const hashedPassword = (await bcrypt.hash(userData.password, 10)) as string;
    const updatedUser = {
      id: Number(userData.id),
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
