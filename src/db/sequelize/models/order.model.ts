import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { CreationOptional } from 'sequelize';
import { User } from 'src/db/sequelize/models/user.model';
import { OrderItem } from 'src/db/sequelize/models/order-item.model';

@Table({
  modelName: 'order',
  tableName: 'Order',
  freezeTableName: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      name: 'orders_created_at_idx',
      fields: [{ name: 'created_at' }],
    },
    {
      name: 'orders_pkey',
      unique: true,
      fields: [{ name: 'id' }],
    },
  ],
})
export class Order extends Model {
  declare id: CreationOptional<number>;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  userId: number;

  @Column({
    type: DataType.ENUM('pending', 'shipped', 'delivered', 'cancelled', 'paid'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'total_price',
  })
  totalPrice: string;

  // @Column({
  //   type: DataType.DATE,
  //   allowNull: true,
  //   field: 'created_at',
  // })
  // declare createdAt: Date;

  @HasMany(() => OrderItem)
  orderItems: OrderItem[];

  @BelongsTo(() => User)
  user: User;
}
