import { Request, Response, Router } from "express";
import { findThumbnail, mapImagesEntity, mapProductsEntity } from "../services/mapping";
import { IProductEntity, ICommentEntity, ProductCreatePayload, IImageEntity, ImageCreatePayload, IProductPatchBody} from "../../types";
import { connection } from "../..";
import { enhanceProductsCommentsImages } from "../helpers";
import { mapCommentsEntity } from "../services/mapping";
import { getProductsFilterQuery } from '../helpers'
import { v4 as uuidv4 } from 'uuid';
import { param, body, validationResult } from "express-validator";

export const productsRouter = Router();

const throwServerError = (res: Response, e: unknown) => {
    res.status(500).json({message: 'Something went wrong'})
}


const ROOT_PATH = '/'

productsRouter.get(`${ROOT_PATH}search`, async (req: Request, res: Response) => {

    try {

        const [query, values] = getProductsFilterQuery(req.query);
        const [rows] = await connection.query<IProductEntity[]>(query, values);
        const [ images ] = await connection.query<IImageEntity[]>(
            `SELECT * FROM images`
        ) 

        if (!rows?.length) {
            res.status(404).json({message: 'Product not found'})
            return;
        }

        const [commentRows] = await connection.query<ICommentEntity[]>(
            "SELECT * FROM comments"
        );

        const products = mapProductsEntity(rows);
        const result = enhanceProductsCommentsImages(products, commentRows, images);

        res.status(200).json({message: 'ok', data: result})
        
    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.get(ROOT_PATH, async (req: Request, res: Response) => {

    try {

        const [productRows] = await connection.query<IProductEntity[]>(
            "SELECT * FROM products"
        );
    
        const [commentRows] = await connection.query<ICommentEntity[]>(
            "SELECT * FROM comments"
        );

        const [ images ] = await connection.query<IImageEntity[]>(
            `SELECT * FROM images`
        )
    
        const products = mapProductsEntity(productRows);
        const result = enhanceProductsCommentsImages(products, commentRows, images);

        res.status(200).json({message: 'ok', data: result});

    } catch (e) {
        throwServerError(res, e);
    }

});

productsRouter.get(`${ROOT_PATH}:id`, async (req: Request, res: Response) => {

    try {

        const [ rows ] = await connection.query<IProductEntity[]>(
            `SELECT * FROM products 
            WHERE id = ?`,
            [req.params.id]
        )

        if(!rows[0]){
            res.status(404).json({message: 'Product not found'})
            return
        }

        const [ comments ] = await connection.query<ICommentEntity[]>(
            "SELECT * FROM comments WHERE product_id = ?",
            [req.params.id]
        );

        const [ images ] = await connection.query<IImageEntity[]>(
            `SELECT * FROM images
            WHERE product_id = ?`,
            [req.params.id]
        ) 

        const product = mapProductsEntity(rows)[0];

        if (comments.length) {
            product.comments = mapCommentsEntity(comments);
        }
        if(images.length) {
            product.images = mapImagesEntity(images)
            product.thumbnail = findThumbnail(images)
        }

        res.status(200).json({message: 'ok', data: product})
        
    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.get(
    `${ROOT_PATH}similar_products/:id`, 
    [
        param('id').isUUID().withMessage('Product id is not UUID')
    ],
    async (req: Request<{id: string}>, res: Response) => {

    try {

        const errors = validationResult(req)

        if(!errors.isEmpty()){
            res.status(400).json({errors: errors.array()})
            return
        }

        const productId = req.params.id

        const [ similarProducts ] = await connection.query(
            `SELECT similar_product_id FROM similar_products
            WHERE product_id = ?`,
            [productId]
        )

        res.status(200).json({message:'ok', data: similarProducts})
        
    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.post(ROOT_PATH, async (req: Request<{}, {}, ProductCreatePayload>, res: Response) => {

    try {

        const productId = uuidv4()
        const { title, description, price, images } = req.body

        await connection.query(
            `INSERT INTO products (id, title, description, price)
            VALUES (?, ?, ?, ?)`,
            [productId, title, description, price]
        )

        if(Array.isArray(images) && images.length > 0){
            for(let index = 0; index < images.length; index++){

                const imageId = uuidv4()
                const url = images[index]
                const main = index === 0 ? 1 : 0
    
                await connection.query(
                    `INSERT INTO images (id, url, product_id, main)
                    VALUES (?, ?, ?, ?)`,
                    [imageId, url, productId, main]
                )
    
            }
        }

        res.status(201).json({message: 'Product added', data: productId})
        
    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.post(`${ROOT_PATH}get-other-products-without-similar-product/:id`, async (req: Request<{id: string}, {}, IProductEntity[]>, res: Response) => {

    try {

        const productId = req.params.id
        const arrayWithSimilarProductsIds = []

        for(let similarProduct of req.body){
            const similarId = similarProduct.id
            arrayWithSimilarProductsIds.push(similarId)
        }
        
        const idsForDelete = [productId, ...arrayWithSimilarProductsIds]

        const placeholder = idsForDelete.map(()=>'?')
        // [id1, id2, id3 ...] => (?,?,? ...)

        const [ otherProducts ] = await connection.query<IProductEntity[]>(
            `SELECT * FROM products
            WHERE id NOT in (${placeholder})`,
            idsForDelete
        )

        res.status(200).json({message: 'ok', data: otherProducts})
        
    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.post(
    `${ROOT_PATH}add-similar-products`, 
    [
        body().isArray().withMessage('Request body is not array')
    ],
    async (req: Request<{}, {}, [string, string]>, res: Response) => {

    try {

        const errors = validationResult(req)

        if(!errors.isEmpty()){
            res.status(400).json({errors: errors.array()})
            return
        }
    
        const [productId, similarProductId] = req.body

        if(!productId || !similarProductId || productId === similarProductId){
            res.status(400).json({message: 'Invalid request body'})
            return
        }

        await connection.query(
            `INSERT INTO similar_products (product_id, similar_product_id)
            VALUES 
            (?, ?)`,
            [productId, similarProductId]
        )

        res.status(200).json({message: 'Similar product added'})
        
    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.post(`${ROOT_PATH}:id/addImage`, async (req: Request<{id: string}, {}, ImageCreatePayload>, res: Response) => {

    try {

        const imageId = uuidv4()
        const productId = req.params.id
        const {url} = req.body
        let main = 0

        const [ rows ] = await connection.query<IProductEntity[]>(
            `SELECT * FROM products
            WHERE id = ?`,
            [productId]
        )

        if(rows.length === 0){
            res.status(404).json({message: 'Product not found'})
            return
        }

        const [ images ] = await connection.query<IImageEntity[]>(
            `SELECT * FROM images
            WHERE product_id = ?`,
            [productId]
        )

        if(images.length === 0){
            main = 1
        }

        await connection.query(
            `INSERT INTO images (id, url, product_id, main)
            VALUES (?, ?, ?, ?)`,
            [imageId, url, productId, main]
        )

        res.status(201).json({message: 'Image added'})
        
    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.post(
    `${ROOT_PATH}update-thumbnail/:id`,
    [
        param('id').isUUID().withMessage('Product id is not UUID'),
        body('imageId').isUUID().withMessage('Image id is not UUID')
    ], 
    async (req: Request<{id: string}, {}, {imageId: string}>, res: Response) => {

    try {

        const errors = validationResult(req)

        if(!errors.isEmpty()){
            res.status(400).json({errors: errors.array()})
            return
        }

        const [ image ] = await connection.query<IImageEntity[]>(
            `SELECT * FROM images
            WHERE id = ?`,
            [req.body.imageId]
        )

        if(image.length === 0){
            res.status(404).json({message: 'Image not found'})
            return
        }

        await connection.query(
            `UPDATE images SET
            main = 0
            WHERE product_id = ?`,
            [req.params.id]
        )

        await connection.query(
            `UPDATE images SET
            main = 1
            WHERE id = ? AND product_id = ?`,
            [req.body.imageId, req.params.id]
        )

        res.status(200).json({message: 'thumbnail updated'})
        
    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.patch(`${ROOT_PATH}:id`, async (req: Request<{id: string}, {}, IProductPatchBody>, res: Response) => {

    try {

        const { title, description, price } = req.body

        const [ product ] = await connection.query<IProductEntity[]>(
            `SELECT * FROM products
            WHERE id = ?`,
            [req.params.id]
        )

        if(product.length === 0){
            res.status(404).json({message: 'Product not found'})
            return
        }
        
        await connection.query(
            `UPDATE products SET
            title = ?,
            description = ?,
            price = ?
            WHERE id = ?`,
            [title, description, Number(price), req.params.id]
        )

        res.status(200).json({message: 'Product updated'})

    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.delete('/:id', async ( req: Request<{ id: string }>, res: Response ) => {
    try {
        const [ rows ] = await connection.query<IProductEntity[]>(
            `SELECT * FROM products
            WHERE id = ?`,
            [req.params.id]
        );

        if (rows.length < 1) {
            res.status(404).json(`Product not found`);
            return;
        }

        await connection.query(
            `DELETE FROM comments
            WHERE product_id = ?`,
            [req.params.id]
        )

        await connection.query(
            `DELETE FROM images
            WHERE product_id = ?`,
            [req.params.id]
        )

        await connection.query(
            `DELETE FROM similar_products
            WHERE product_id = ?`,
            [req.params.id]
        )

        await connection.query(
            `DELETE FROM products
            WHERE id = ?`,
            [req.params.id]
        )

        res.status(200).end()
    } catch (error) {
        throwServerError(res, error);
    }
});

productsRouter.post(`${ROOT_PATH}:product_id/deleteImages`, async (req: Request<{product_id: string}, {}, {id: string[]}>, res: Response) => {

    try {

        const { id } = req.body

        if(id.length === 0){
            res.status(400).json({message: 'invalid request body'})
            return
        }

        if(Array.isArray(id)){
            for(let imgIds of id){
                await connection.query(
                    `DELETE FROM images
                    WHERE id = ? AND product_id = ? `,
                    [imgIds, req.params.product_id]
                )
            }
        }else{
            res.status(400).json({message: 'invalid request body'})
            return
        }

        res.status(200).json({message: 'Images deleted'})

    } catch (error) {
        throwServerError(res, error)
    }

})

productsRouter.post(
    `${ROOT_PATH}delete-similar-products/:id`, 
    [
        body().isArray().withMessage('Request body is not array'),
        param('id').isUUID().withMessage('Product id is not UUID')
    ],
    async (req: Request<{id: string}, {}, string[]>, res: Response) => {

    try {

        const errors = validationResult(req)

        if(!errors.isEmpty()){
            res.status(400).json({errors: errors.array()})
            return
        }

        const arrayWithIds = req.body
        const productId = req.params.id

        if(arrayWithIds.length === 0){
            res.status(400).json({message: 'Invalid request body'})
            return
        }

        for(let similarProductId of arrayWithIds){

            if(similarProductId.trim() === ''){
                res.status(400).json({message: 'Invalid request body'})
                return
            }

            await connection.query(
                `DELETE FROM similar_products
                WHERE similar_product_id = ? AND product_id = ?`,
                [similarProductId, productId]
            )
        }

        res.status(200).json({message: 'Similar products deleted'})
        
    } catch (error) {
        
        throwServerError(res, error)

    }

})



