import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import style from './productsList.module.scss'
import axios from 'axios'
import type { AxiosData } from '../../types'
import type { IProduct } from '@Shared'
import  emptyImg from '/product-placeholder.png'

export const ProductsList = () => {

    const [ products, setProducts ] = useState<IProduct[]>([])
    const [ filterTitle, setFilterTitle ] = useState<string>('')
    const [ filterPriceFrom, setFilterPriceFrom ] = useState<number>(0)
    const [ filterPriceTo, setFilterPriceTo ] = useState<number>(0)

    const handleChangeFilterTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterTitle(event.target.value)
    }
    const handleChangeFilterPriceFrom = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterPriceFrom(Number(event.target.value))
    }
    const handleChangeFilterPriceTo = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterPriceTo(Number(event.target.value))
    }

    useEffect(()=>{

        const fetchProducts = async () => {
            const { data } = await axios.get<AxiosData>(`/api/products`)
            setProducts(data.data)
        }

        fetchProducts()

    }, [])

    const filteredProducts = useMemo(()=>{

        let result = [...products]

        if(filterTitle && filterTitle.trim() !== ''){
            result = result.filter((product) => product.title.toLowerCase().includes(filterTitle.toLowerCase()))
        }

        if(filterPriceFrom && filterPriceFrom > 0){
            result = result.filter((product) => product.price > filterPriceFrom)
        }

        if(filterPriceTo && filterPriceTo > 0){
            result = result.filter((product) => product.price < filterPriceTo)
        }

        return result

    }, [products, filterTitle, filterPriceFrom, filterPriceTo])

    console.log(filterPriceTo)
    
    return(
        <>
            <header className={style.productList_header}>
                <h1>cписок товаров {products.length}</h1>
            </header>

            <div className={style.productsList_filter}>

                <p>фильтр для поиска товаров по названию и стоимости</p>

                <div className={style.filters_line}>

                    <div className={style.filter_title}>

                        <label htmlFor={style.filter_input}>Название</label>
                        <input id={style.filter_input} type="text" placeholder='название продукта' onChange={handleChangeFilterTitle}/>

                    </div>

                    <div className={style.filter_price}>

                        <div className={style.filter_priceFrom}>
                            <label htmlFor={style.filter_input}>От:</label>
                            <input id={style.filter_input} type="text" placeholder='цена (от...)' onChange={handleChangeFilterPriceFrom}/>
                        </div>

                        <div className={style.filter_priceTo}>
                            <label htmlFor={style.filter_input}>До:</label>
                            <input id={style.filter_input} type="text" placeholder='цена (до...)' onChange={handleChangeFilterPriceTo}/>
                        </div>

                    </div>

                </div>

            </div>

            <main>
                <div className={style.productsList}>
                    <div className={style.productsListInner}>
                    {filteredProducts.map((product, index)=>(
                        <div className={style.product_card} key={index}>

                            <div className={style.product_title}>
                                <Link to={`/product/${product.id}`}>{product.title}</Link>
                            </div>

                            <div className={style.product_img}>
                                <img src={emptyImg} style={{width: 200, height: 200}}/>
                            </div>

                            <div className={style.product_price}>
                                <p>Цена: {product.price}</p>
                            </div>

                            <div className={style.product_comments}>
                                <p>Всего коментариев: {product.comments?.length || 0}</p>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            </main>
        </>
    )
}