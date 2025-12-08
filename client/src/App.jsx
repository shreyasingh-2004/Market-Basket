import React from 'react'
import Navbar from './component/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import { Toaster } from 'react-hot-toast'
import Footer from './component/Footer'
import { useAppContext } from './context/AppContext'
import Login from './component/Login'
import AllProducts from './pages/AllProducts'
import ProductCategory from './pages/ProductCategory'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import AddAddress from './pages/AddAddress'
import MyOrders from './pages/MyOrders'
import SellerLogin from './component/seller/SellerLogin'
import SellerLayout from './pages/seller/SellerLayout'
import AddProduct from './pages/seller/AddProduct'
import ProductList from './pages/seller/ProductList'
import Orders from './pages/seller/Orders'
import Loading from './component/Loading'

const App = () => {
  const location = useLocation();
  const isSellerPath = location.pathname.includes("seller");
  const { ShowUserLogin, isSeller } = useAppContext();

  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>
      
      {/* Show Navbar for user pages only */}
      {!isSellerPath && <Navbar />}

      {/* User Login Modal */}
      {ShowUserLogin && <Login />}

      <Toaster />

      {/* Apply padding only for user paths */}
      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products' element={<AllProducts />} />
          <Route path='/products/:category' element={<ProductCategory />} />
          <Route path='/products/:category/:id' element={<ProductDetail />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/add-address' element={<AddAddress />} />
          <Route path='/my-order' element={<MyOrders />} />
          <Route path='/loader' element={<Loading />} />


          {/* Seller Routes */}
          <Route 
            path='/seller' 
            element={isSeller ? <SellerLayout /> : <SellerLogin />}
          >
            <Route index element={<AddProduct />} />
            <Route path='product-list' element={<ProductList />} />
            <Route path='orders' element={<Orders />} />
          </Route>

        </Routes>
      </div>

      {/* Show footer for user pages only */}
      {!isSellerPath && <Footer />}

    </div>
  )
}

export default App;
