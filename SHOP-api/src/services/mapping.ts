import { IComment, IImage, IProduct } from "@Shared/types";
import { ICommentEntity, IImageEntity, IProductEntity } from "../../types";

export const mapCommentEntity = ({ id, product_id, name, email, body }: ICommentEntity): IComment => {
    return {
        id,
        productId: product_id,
        name,
        email,
        body,
    }
}

export const mapCommentsEntity = (data: ICommentEntity[]): IComment[] => {
    return data.map(mapCommentEntity);
}

export const mapProductsEntity = (data: IProductEntity[]): IProduct[] => {
    return data.map(({ id, title, description, price, images, thumbnail }) => ({
        id: id,
        title: title || "",
        description: description || "",
        price: Number(price) || 0,
        images: images || [],
        thumbnail: thumbnail || null,
    }))
}

export const mapImageEntity = ({id, url, product_id, main}: IImageEntity) => {
    return {
        id: id,
        url: url,
        product_id: product_id,
        main: main,
    }
}

export const mapImagesEntity = (data: IImageEntity[]): IImage[] => {
    return data.map(mapImageEntity)
}

export const findThumbnail = (data: IImageEntity[]): IImageEntity | null => {
    for(let thum of data){
        if(Number(thum.main) === 1){
            return thum
        }
    }
    return null
}