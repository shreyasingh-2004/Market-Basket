import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext';
import ProductCard from './../component/ProductCard'

const AllProducts = () => {
    const { products, SearchQuery } = useAppContext(); 
    const [filteredProducts, setFilteredProducts] = useState([])

    useEffect(() => {
        if (SearchQuery.length > 0) {
            setFilteredProducts(products.filter(
                product => product.name.toLowerCase().includes(SearchQuery.toLowerCase())
            ))
        } else {
            setFilteredProducts(products)
        }
    }, [products, SearchQuery])
    return (
        <div className='mt-6 flex flex-col'>
            <div className='flex flex-col items-end w-max'>
                <p className='text-2xl font-medium uppercase'>All Products</p>
                <div className='w-16 h-0.5 bg-primary rounded-full'></div>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3
            md:gap-6 lg:grid-cols-5 mt-6'>
                {filteredProducts
                    ?.filter((product) => product.inStock)  
                    .map((product, index) => (
                        <ProductCard key={index} product={product} />
                    ))}
            </div>
        </div>

    )
}

export default AllProducts
