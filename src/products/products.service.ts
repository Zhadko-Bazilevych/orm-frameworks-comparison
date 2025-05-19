import { Inject } from '@nestjs/common';
import { BaseService } from 'src/utils/utils.service';
import { IProductsService } from 'src/products/products.types';
import { ProductsSequelizeService } from 'src/products/products.sequelize.service';
import { InterfaceToType } from 'src/utils/utils.types';
import { ProductsTypeOrmService } from 'src/products/products.typeorm.service';
import { ProductsPrismaService } from 'src/products/products.prisma.service';

export class ProductsService extends BaseService<
  InterfaceToType<IProductsService>
> {
  constructor(
    @Inject(ProductsSequelizeService)
    productsSequelizeService: ProductsSequelizeService,
    @Inject(ProductsTypeOrmService)
    productsTypeOrmService: ProductsTypeOrmService,
    @Inject(ProductsPrismaService)
    productsPrismaService: ProductsPrismaService,
  ) {
    super(
      productsSequelizeService,
      productsTypeOrmService,
      productsPrismaService,
    );
  }
}
