// Контроллер — это посредник между Model и View. Он принимает запрос от пользователя и решает, что делать.

// За что отвечает:
// Получение запроса от клиента (GET, POST, PUT, DELETE)
// Вызов нужных методов Model
// Передаа данных в View
// Редиректы
// Обработка ошибок

import { Request, Response, Router } from "express";
import { getProduct, getProducts, searchProducts, removeProduct, updateProduct, getSimilarProducts, getOtherProducts, addNewProduct } from "../models/products.model";
import { IProductFilterPayload } from "@Shared/types";
import { IProductEditData, ProductCreatePayload } from "../types";
import { throwServerError } from "./helper";
import { host } from "../models/const";

export const productsRouter = Router()

productsRouter.get('/', async (req: Request, res: Response) => {

    try {

        const products = await getProducts()
        res.render("products", {items: products, queryParams: {}})
        
    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.get('/new-product', async (req: Request, res: Response) => {

    try {
        res.render("newProduct/new-product")
    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.post('/products', async (req: Request<{id: string}, {}, ProductCreatePayload>, res: Response ) => {

    try {

        const { title, description, price } = req.body

        const isValidReqBody =
        title && title.trim() !== '' &&
        description && description.trim() !== '' &&
        Number(price) && Number(price) > 0

        if(isValidReqBody){
            const newProductId = await addNewProduct(req.body)
            res.redirect(`/${process.env.ADMIN_PATH}/${newProductId}`)
            return
        }

        res.redirect(`/${process.env.ADMIN_PATH}/new-product`)

    } catch (error) {
        throwServerError(res, error)
    }

})


productsRouter.get('/search', async (req: Request<{},{},{}, IProductFilterPayload>, res: Response) => {

    try {

        const products = await searchProducts(req.query)
        res.render('products', {items: products, queryParams: req.query})
        
    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.get('/:id', async (req: Request<{id: string}>, res: Response) => {

    try {

        const product = await getProduct(req.params.id)
        const arrayWithSimilarProductsId = await getSimilarProducts(req.params.id)
        const similarProducts: any[] = []

        for(let similarProductId of arrayWithSimilarProductsId){
            const similarProduct = await getProduct(similarProductId)
            if(similarProduct){
                similarProducts.push(similarProduct)
            }
        }

        const otherProducts = await getOtherProducts(req.params.id, similarProducts)
        
        if(product){
            res.render('product/product', {item: product, similarProducts, otherProducts})
            return
        }

        res.render('product/empty-product', {id: req.params.id})
        
    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.get('/remove-product/:id', async (req: Request<{id: string}>, res: Response) => {

    try {

        if(req.session.username === 'admin'){
            await removeProduct(req.params.id)
            res.redirect(`/${process.env.ADMIN_PATH}`)
            return
        }

        res.status(403).send('Forbidden')
        
    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.post('/save/:id', async (req: Request<{id: string}, {}, IProductEditData>, res: Response) => {

    try {

        const updatedProduct = await updateProduct(req.params.id, req.body)
        res.redirect(`/${process.env.ADMIN_PATH}`)

    } catch (error) {
        throwServerError(res, error)
    }

})