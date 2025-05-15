import { Module } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { ProductsController } from 'src/products/products.controller';
import { Product as SequelizeProductModel } from 'src/db/sequelize/models/product.model';
import { Product as TypeOrmProductModel } from 'src/db/typeorm/models/product.model';
import { ProductsSequelizeService } from 'src/products/products.sequelize.service';
import { DataSource } from 'typeorm';
import { ProductsTypeOrmService } from 'src/products/products.typeorm.service';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsSequelizeService,
    ProductsTypeOrmService,
    {
      provide: 'PRODUCT_REPOSITORY_TYPEORM',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(TypeOrmProductModel),
      inject: [DataSource],
    },

    {
      provide: 'PRODUCT_MODEL_SEQUELIZE',
      useValue: SequelizeProductModel,
    },
  ],
})
export class ProductsModule {}
