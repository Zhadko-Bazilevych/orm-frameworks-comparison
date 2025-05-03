export type ORM = 'sequelize' | 'typeorm' | 'prisma';
export type QueryType = 'raw' | 'default';
export type InterfaceToType<T> = { [K in keyof T]: T[K] };
export type Service = Record<string, (...args: any) => any>;

export type BaseResponse<TModel> = {
  data: TModel;
  timeMs: number;
};

export type GetServiceImplementation<T extends Service> = {
  [K in keyof T as
    | `${Extract<K, string>}Raw`
    | `${Extract<K, string>}Default`]: T[K];
};
