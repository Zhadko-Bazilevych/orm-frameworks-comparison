import { Module } from '@nestjs/common';
import { UtilsController } from 'src/utils/utils.controller';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Module({
  controllers: [UtilsController],
  providers: [PrismaService],
})
export class UtilsModule {}
