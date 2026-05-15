import type { IProductSearchFilter } from "../SHOP-api/types";

export interface IComment {
    id: string;
    name: string;
    email: string;
    body: string;
    productId: string;
}

export interface IProduct {
    id: string;
    title: string;
    description: string;
    price: number;
    comments?: IComment[];
    images: IImage[];
    thumbnail: IImage | null;
}

export interface IImage {
    id: string;
    url: string;
    product_id: string;
    main: number;
}

export interface IProductFilterPayload extends IProductSearchFilter {}

export interface IAuthRequisites {
    username: string;
    password: string;
}
