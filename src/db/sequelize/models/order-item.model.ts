import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Order } from 'src/db/sequelize/models/order.model';
import { Product } from 'src/db/sequelize/models/product.model';

@Table({
  modelName: 'order_item',
  tableName: 'Order_item',
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      name: 'order_items_pkey',
      unique: true,
      fields: [{ name: 'order_id' }, { name: 'product_id' }],
    },
  ],
})
export class OrderItem extends Model {
  @ForeignKey(() => Order)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'order_id',
  })
  declare orderId: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'product_id',
  })
  declare productId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare quantity: number;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
  })
  declare price: number;

  @BelongsTo(() => Order)
  declare order: Order;

  @BelongsTo(() => Product)
  declare product: Product;
}
