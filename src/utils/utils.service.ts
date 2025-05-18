import { Injectable } from '@nestjs/common';
import {
  GetServiceImplementation,
  ORM,
  QueryType,
} from 'src/utils/utils.types';

@Injectable()
export class BaseService<
  Service extends Record<string, (...args: any) => any>,
> {
  constructor(
    private readonly sequelizeOrmService?: GetServiceImplementation<Service>,
    private readonly typeOrmService?: GetServiceImplementation<Service>,
    private readonly prismaOrmService?: GetServiceImplementation<Service>,
  ) {}

  call<Method extends Extract<keyof Service, string>>(
    orm: ORM,
    method: Method,
    queryType: QueryType,
    params: Parameters<Service[Method]>,
  ): ReturnType<Service[Method]> {
    let service: GetServiceImplementation<Service>;
    switch (orm) {
      case 'sequelize':
        if (!this.sequelizeOrmService) {
          throw new Error('sequelize service is not implemented');
        }
        service = this.sequelizeOrmService;
        break;
      case 'prisma':
        if (!this.prismaOrmService) {
          throw new Error('prisma service is not implemented');
        }
        service = this.prismaOrmService;
        break;
      case 'typeorm':
        if (!this.typeOrmService) {
          throw new Error('typeOrm service is not implemented');
        }
        service = this.typeOrmService;
        break;
    }

    switch (queryType) {
      case 'raw':
        return service[method + 'Raw'](...params);
      case 'default':
        return service[method + 'Default'](...params);
      default:
        throw new Error("can't find method: " + method);
    }
  }
}
