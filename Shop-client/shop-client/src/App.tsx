import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainPage } from './components/mainPage/MainPage'
import { ProductsList } from './components/productsList/ProductsList'
import { Product } from './components/product/Product'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/products-list" element={<ProductsList/>} />
        <Route path="/product/:id" element={<Product />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

