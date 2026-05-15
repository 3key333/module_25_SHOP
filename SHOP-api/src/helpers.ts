import { IComment, IProduct, IImage } from "@Shared/types";
import { ICommentEntity, IImageEntity, IProductSearchFilter } from "../types";
import { mapCommentEntity, mapImageEntity } from "./services/mapping";

export const enhanceProductsCommentsImages = ( products: IProduct[], commentRows: ICommentEntity[], images: IImageEntity[] ): IProduct[] => {
    const commentsByProductId = new Map<string, IComment[]> ();
    const imagesByProductId = new Map<string, IImage[]>()

    for (let commentEntity of commentRows) {
        const comment = mapCommentEntity(commentEntity);
        if (!commentsByProductId.has(comment.productId)) {
            commentsByProductId.set(comment.productId, []);
        }

        const list = commentsByProductId.get(comment.productId) || [];
        commentsByProductId.set(comment.productId, [...list, comment]);
    }

    for(let imageEntity of images){
        const image = mapImageEntity(imageEntity)
        if(!imagesByProductId.has(image.product_id)){
            imagesByProductId.set(image.product_id, [])
        }

        const list = imagesByProductId.get(image.product_id) || []
        imagesByProductId.set(image.product_id, [...list, image])
    }


    for (let product of products) {
        if (commentsByProductId.has(product.id)) {
            product.comments = commentsByProductId.get(product.id);
        }
        if(imagesByProductId.has(product.id)){
            product.images = imagesByProductId.get(product.id) || []
        }

        const currentImages = imagesByProductId.get(product.id)
        if(currentImages){
            for(let thum of currentImages){
                if(Number(thum.main) === 1){
                    product.thumbnail = thum
                }
            }
        }
    }

    return products;
}

export const getProductsFilterQuery = (filter: IProductSearchFilter): [string, Array<string | number>] => {
    const { title, description, priceFrom, priceTo } = filter;

    let query = "SELECT * FROM products WHERE ";
    const values: Array<string | number> = []

    if (title) {
        query += "title LIKE ? ";
        values.push(`%${title}%`);
    }

    if (description) {
        if (values.length) {
            query += " OR ";
        }

        query += "description LIKE ? ";
        values.push(`%${description}%`);
    }

    if (priceFrom || priceTo) {
        if (values.length) {
            query += " OR ";
        }

        query += `(price > ? AND price < ?)`;
        values.push(priceFrom || 0);
        values.push(priceTo || 999999);
    }

    return [query, values];
}