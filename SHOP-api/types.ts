import type { RowDataPacket } from "mysql2";
import type { IComment, IProduct, IImage, IAuthRequisites } from "@Shared/types";

export interface ICommentEntity extends RowDataPacket {
    id: string;
    name: string;
    email: string;
    body: string;
    product_id: string;
}

export type CommentCreatePayload = Omit<IComment, "id">;

export interface IProductEntity extends IProduct, RowDataPacket {
    id: string;
}

export interface IProductPatchBody {
    title: string;
    description: string;
    price: number;
}

export interface IProductSearchFilter {
    title?: string;
    description?: string;
    priceFrom?: number;
    priceTo?: number;
}

export interface ProductCreatePayload {
    title: string;
    description: string;
    price: number;
    images?: string[];
}

export interface IImageEntity extends RowDataPacket {
    id: string;
    url: string;
    product_id: string;
    main: number;
}

export type ImageCreatePayload = Omit<IImage, "id" | "product_id" | "main">

export interface IUserRequisitesEntity extends IAuthRequisites, RowDataPacket {
    id: number;
} 

