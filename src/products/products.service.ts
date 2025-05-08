import { Inject } from '@nestjs/common';
import { BaseService } from 'src/utils/utils.service';
import { IProductsService } from 'src/products/products.types';
import { ProductsSequelizeService } from 'src/products/products.sequelize.service';
import { InterfaceToType } from 'src/utils/utils.types';

export class ProductsService extends BaseService<
  InterfaceToType<IProductsService>
> {
  constructor(
    @Inject(ProductsSequelizeService)
    productsSequelizeService: ProductsSequelizeService,
    // @Inject(ProductTypeOrmService)
    // productTypeOrmService: ProductTypeOrmService,
  ) {
    super(productsSequelizeService);
  }
}
