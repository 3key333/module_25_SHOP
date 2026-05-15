import { useEffect, useState } from 'react'
import style from './product.module.scss'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import type { IProduct } from '@Shared'
import emptyImg from '/product-placeholder.png'
import type { AxiosData, SimilarProductsIdsArray } from '../../types'

export const Product = () => {

    const {id = ''} = useParams()

    const [product, setProduct] = useState<IProduct | null>(null)
    const [similarProductsIds, setSimilarProductsIds] = useState<SimilarProductsIdsArray[]>([]) 
    const [similarProducts, setSimilarProducts] = useState<IProduct[]>([])
    const [newCommentTitle, setNewCommentTitle] = useState<string>('')
    const [newCommentEmail, setNewCommentEmail] = useState<string>('')
    const [newCommentBody, setNewCommentBody] = useState<string>('')

    const handlerInputNewCommentTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewCommentTitle(event.target.value)
    }
    const handlerInputNewCommentEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewCommentEmail(event.target.value)
    }
    const handlerInputNewCommentBody = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewCommentBody(event.target.value)
    }

    const refreshProduct = async () => {
        const { data } = await axios.get<{message: string, data: IProduct}>(`/api/products/${id}`)
        setProduct(data.data)
    }

    if(id.length !== 36){
        return null
    }
    

    useEffect(()=>{

        const fetchProduct = async () => {
            const { data } = await axios.get<{message: string, data: IProduct}>(`/api/products/${id}`)
            setProduct(data.data)
        }
        fetchProduct()

        const fetchSimilarProductsIds = async () => {
            const { data } = await axios.get<AxiosData>(`/api/products/similar_products/${id}`)
            setSimilarProductsIds(data.data)
        }
        fetchSimilarProductsIds()

    }, [id])

    useEffect(()=>{

        const fetchSimilarProducts = async () => {
            const array: IProduct[] = []
            for(let similar of similarProductsIds){
                const { data } = await axios.get<{messsage: string, data: IProduct}>(`/api/products/${similar.similar_product_id}`)
                const payload: IProduct = data.data
                array.push(payload)
            }
            setSimilarProducts(array)
        }
        fetchSimilarProducts()

    }, [similarProductsIds])

    const saveNewComment = async () => {
        try {

            await axios.post('/api/comments', {name: newCommentTitle, email: newCommentEmail, body: newCommentBody, productId: id})
            setNewCommentTitle('')
            setNewCommentEmail('')
            setNewCommentBody('')

            await refreshProduct()
            
        } catch (error) {
            console.log(error)
        }
    }


    return(
        <>
          <header className={style.product_header}>
            <h1>{product?.title}</h1>
            <hr />
          </header>

          <section className={style.productInfo}>
            <div className={style.productInfoInner}>

                <div className={style.product_rightSection}>
                
                <div className={style.productInfo_images}>

                    <img src={emptyImg} alt="" />

                    <div className={style.productInfo_anotherImages}>
                        <h2>Другие изображения:</h2>

                        {product?.images?.map((img, index) => (
                            <img src={img.url} alt="" key={index}/>
                        ))}

                    </div>

                </div>

                <div className={style.product_description}>
                    <h2>Описание:</h2>
                    <p>{product?.description}</p>
                </div>

                <div className={style.product_price}>
                    <h2>Цена:</h2>
                    <p>{[product?.price]}</p>
                </div>
                

                <div className={style.product_similarProductsList}>

                    <h2>Похожие товары:</h2>
                    {similarProducts?.map((product, index) => (
                        <div className={style.similarProduct_card} key={index}>
                            <Link to={`/product/${product.id}`}>{product?.title}</Link>
                            <p>({product?.price})</p>
                        </div>
                    ))}

                </div>

                <div className={style.product_comments}>
                    <h2>Коментарии:</h2>
                    {product?.comments?.map((comment, index) => (
                        <div className={style.comment_block} key={index}>
                            <div className={style.commentTitle}>
                                <p>Title: {comment.name}</p>
                            </div>

                            <div className={style.commentEmail}>
                                <p>Email: {comment.email}</p>
                            </div>

                            <div className={style.commentBody}>
                                <p>Text: {comment.body}</p>
                            </div>
                        </div>
                    ))}

                </div>

                </div>

                <div className={style.productAddNewComment_form}>
                    <h2>Добавить новый комментарий:</h2>

                    <div className={style.newComment_title}>
                        <input type="text" placeholder='введите название' value={newCommentTitle} onChange={handlerInputNewCommentTitle}/>
                    </div>

                    <div className={style.newComment_email}>
                        <input type="text" placeholder='введите почту' value={newCommentEmail} onChange={handlerInputNewCommentEmail}/>
                    </div>

                    <div className={style.newComment_body}>
                        <input type="text" placeholder='введите текст' value={newCommentBody} onChange={handlerInputNewCommentBody}/>
                    </div>

                    <div className={style.newComment_button}>
                        <button type='button' onClick={()=>saveNewComment()}>СОХРАНИТЬ</button>
                    </div>
                </div>

            </div>
          </section>
        </>
    )
}