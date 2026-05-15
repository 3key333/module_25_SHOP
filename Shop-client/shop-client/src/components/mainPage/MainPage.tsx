import { Link } from 'react-router-dom'
import style from './mainPage.module.scss'
import axios from 'axios'
import { useEffect, useState } from 'react'
import type { AxiosData } from '../../types'
import type { IProduct } from '@Shared/types'

export const MainPage = () => {

    let allProductsPrice = 0

    const [products, setProducts] = useState<IProduct[]>([])

    useEffect(()=>{
        const fetchProducts = async () => {
            try {

                const { data } = await axios.get<AxiosData>('/api/products')
                setProducts(data.data)
                
            } catch (error) {
                console.log(error)
            }
        }
        fetchProducts()
    }, [])

    for(let product of products){
        allProductsPrice += Math.round(product.price)
    }

    return(
        <>

        <header className={style.mainPage_header}>

          <h1>SHOP CLIENT</h1>

          <div className={style.bottomText_header}>
            <p>в базе данных находится {products.length} товаров общей стоимостью {allProductsPrice}</p>
          </div>

        </header>

        <main className={style.mainPage_main}>
          <nav className={style.mainNavigation}>

            <Link to={'/products-list'}>перейти к списку товаров</Link>

            <a href={`/${import.meta.env.VITE_ADMIN_PATH}`}>перейти в систему администрирования</a>

          </nav>
        </main>

        </>
    )
}