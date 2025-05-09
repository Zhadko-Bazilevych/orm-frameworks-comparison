import { Product } from 'src/products/products.types';
import { User } from 'src/users/users.types';
import { BaseResponse } from 'src/utils/utils.types';
import {
  GetServiceImplementation,
  InterfaceToType,
} from 'src/utils/utils.types';

export interface ICommentsServiceImplementation
  extends GetServiceImplementation<InterfaceToType<ICommentsService>> {}

export type Comment = {
  id?: number;
  userId: number | null;
  productId: number | null;
  parentId: number | null;
  content: string;
  createdAt: Date | null;
  user?: User;
  product?: Product;
  parentComment?: Comment;
};

export interface ICommentsService {
  getCommentTreeById(parentCommentId: number): Promise<BaseResponse<Comment>>;
}
