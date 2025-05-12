import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { CreationOptional } from 'sequelize';
import { Product } from 'src/db/sequelize/models/product.model';

@Table({
  modelName: 'category',
  tableName: 'Category',
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      name: 'categories_pkey',
      unique: true,
      fields: [{ name: 'id' }],
    },
  ],
})
export class Category extends Model {
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare name: string;

  @HasMany(() => Product)
  declare products: Product[];
}
