export interface IProductEditData{
    title: string;
    description: string;
    price: string;
    mainImage: string;
    newImages?: string;
    commentsToRemove: string | string[];
    imagesToRemove: string | string[];
    similarProductsToRemove: string | string[];
    otherProductsToSimilar: string | string[];
}

export interface ProductCreatePayload {
    title: string;
    description: string;
    price: number;
    images?: string[];
}
