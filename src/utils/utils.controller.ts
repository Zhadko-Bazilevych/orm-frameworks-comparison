import { Body, Controller, Get, Query } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { ORM } from 'src/utils/utils.types';
import { DataSource } from 'typeorm';

@Controller('utils')
export class UtilsController {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly typeorm: DataSource,
    private readonly prisma: PrismaService,
  ) {}

  @Get('reconnect')
  async reconnect(@Query('orm') orm: ORM) {
    switch (orm) {
      case 'sequelize':
        return await this.sequelize.models.category.findOne();
      case 'typeorm':
        return await this.typeorm.query('select 1');
      case 'prisma':
        await this.prisma.$queryRaw`select 1`;
        return await this.prisma.category.findFirst();
    }
  }
}
