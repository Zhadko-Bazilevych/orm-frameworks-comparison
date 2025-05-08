import { Module } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { ProductsController } from 'src/products/products.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from 'src/db/sequelize/models/product.model';
import { ProductsSequelizeService } from 'src/products/products.sequelize.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsSequelizeService],
  imports: [SequelizeModule.forFeature([Product])],
})
export class ProductsModule {}
