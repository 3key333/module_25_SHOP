// Модель — это компонент, который работает с данными и бизнес-логикой. Она НЕ знает о View и Controller.

// За что отвечает:
// Работа с базой данных (CRUD)
// Валидация данных
// Бизнес-правила (скидки, расчеты)
// Получение и сохранение данных

import axios from "axios";
import { IProduct, IProductFilterPayload } from "@Shared/types"
import { IProductEditData, ProductCreatePayload } from "../types";
import { host } from "./const";


export async function getProducts (): Promise<IProduct[]> {

    const { data }  = await axios.get(`${host}/products`)

    if (Array.isArray(data)) {
        return data 
    }

    if(data && typeof data === 'object'){
        const payload = data // переменная для удобства
        // то что приходит с сервера: {message: '', data: []}

        if(Array.isArray(payload.data)){
            return payload.data
        }

    }

    return []
}

export async function searchProducts (queryFilter: IProductFilterPayload): Promise<IProduct[]> {

    const { data } = await axios.get(
        `${host}/products/search`,
        {params: queryFilter}
    )

    if (Array.isArray(data)) {
        return data
    }

    if (data && typeof data === "object"){
        const payload = data

        if(Array.isArray(payload.data)){
            return payload.data
        }

        return []
    }

    return []
}

export async function getProduct(id: string): Promise<IProduct | null> {

    try {

        const { data } = await axios.get(
            `${host}/products/${id}`
        )

        if(data && typeof data === 'object'){

            const payload = data

            if(payload.data && typeof payload.data === 'object'){
                return payload.data
            }

            return data
        }

        return null

    } catch (error) {
        console.log(error)
        return null
    }
    
}

export async function removeProduct(id: string): Promise<void> {
    await axios.delete(`${host}/products/${id}`)
}

export async function updateProduct (productId: string, formData: IProductEditData): Promise<IProduct | null> {

    try {

        const {data: currentProduct} = await axios.get<IProduct>(`${host}/products/${productId}`)

        if(formData.commentsToRemove){
            const raw = formData.commentsToRemove
            const commentsIdsForDelete = Array.isArray(raw) ? raw : [raw] 

            for(let commentId of commentsIdsForDelete){
                try {
                    await axios.delete(`${host}/comments/${commentId}`)
                } catch (error) {
                    console.log(`кнопка "save" нажата, не удалось удалить комментарий`, error)
                }
            }

        }
 
        if(formData.imagesToRemove){

            const imgsId = formData.imagesToRemove
            
            if(Array.isArray(imgsId)){
                await axios.post(`${host}/products/${productId}/deleteImages`, {id: imgsId})
            }

        }

        if(formData.similarProductsToRemove){
            const similarProductsIds = formData.similarProductsToRemove
            const ids = Array.isArray(similarProductsIds) ? similarProductsIds : [similarProductsIds]

            await axios.post(`${host}/products/delete-similar-products/${productId}`, ids)
        }

        if(formData.otherProductsToSimilar){
            const otherProductsIds = formData.otherProductsToSimilar
            const ids = Array.isArray(otherProductsIds) ? otherProductsIds : [otherProductsIds] 

            for(let id of ids){
                await axios.post(`${host}/products/add-similar-products`, [productId, id])
            }

        }

        if(formData.newImages){

            const imagesToArray = (urls: string): string[] => {
                return urls
                .split(/\r\n|,/g)
                .map(url => url.trim())
                .filter(url => url.length > 0)
            }

            const urlsArray = imagesToArray(formData.newImages)

            if(urlsArray.length > 0){
                if(!urlsArray.includes(formData.mainImage)){
                    formData.mainImage = urlsArray[0]
                }
            }

            for(let url of urlsArray){
                await axios.post(`${host}/products/${productId}/addImage`, {id: productId, url})
            }

        }

        if(formData.mainImage && formData.mainImage !== currentProduct?.thumbnail?.id){
            await axios.post(`${host}/products/update-thumbnail/${productId}`, {imageId: formData.mainImage})
        }

        const isValidReqBody = formData.title.trim() !== '' && formData.description.trim() !== '' && formData.price.trim() !== ''

        if(isValidReqBody){
            const title = formData.title
            const description = formData.description
            const price = formData.price
            await axios.patch(`${host}/products/${productId}`, {title: title, description: description, price: price})
        }

        return currentProduct
        
    } catch (error) {
        console.log(error)
        return null
    }

}

export async function getSimilarProducts(productId: string): Promise<string[]> {

    try {

        const { data } = await axios.get(`${host}/products/similar_products/${productId}`);

        if(Array.isArray(data.data)){
            const arrayWithObjects = data.data
            const similarProducts = arrayWithObjects.map((obj: {similar_product_id: string}) => obj.similar_product_id)

            return similarProducts
        }

        return []

    } catch (error) {
        console.log(error)
        return []
    }

}

export async function getOtherProducts(productId: string, arrayWithSimilarProductsIds: string[] | []) {

    try {

        const { data } = await axios.post(`${host}/products/get-other-products-without-similar-product/${productId}`, arrayWithSimilarProductsIds)

        if(data && typeof data === 'object') {
            const payload = data

            if(Array.isArray(payload.data)){
                const otherProducts = payload.data
                return otherProducts
            }

        }
        
    } catch (error) {
        console.log(error)
        return []
    }
    
}

export async function addNewProduct(body: ProductCreatePayload) {

    try {

        const {data} = await axios.post(`${host}/products`, body)

        if(data && typeof data === 'object'){
            const payload = data
            const newProductId = payload.data
            return newProductId
        }

        return null

    } catch (error) {
        console.log(error)
        return null
    }
    
}


