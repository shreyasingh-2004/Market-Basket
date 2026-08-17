import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "./../context/AppContext";
import { assets } from "./../assets/assets";
import ProductCard from '../component/ProductCard';

const ProductDetail = () => {
    const { products, currency, addToCart } = useAppContext();
    const navigate = useNavigate();
    const { id } = useParams();

    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);

    // Improved product finding with consistent ID comparison
    const product = products.find((item) => {
        // Convert all IDs to strings for consistent comparison
        const itemId = String(item._id || item.id);
        const searchId = String(id);
        return itemId === searchId;
    });

    useEffect(() => {
        if (product && products.length > 0) {
            // Filter related products by category, excluding the current product
            const productsCopy = products.filter((item) => {
                // Compare categories case-insensitively
                const isSameCategory = product.category.toLowerCase() === item.category.toLowerCase();

                // Exclude current product with consistent ID comparison
                const itemId = String(item._id || item.id);
                const currentId = String(product._id || product.id);
                const isNotCurrent = itemId !== currentId;

                return isSameCategory && isNotCurrent;
            });

            setRelatedProducts(productsCopy.slice(0, 5));

            // Debug logging to help identify issues
            console.log("Current product:", product);
            console.log("Related products found:", productsCopy.length);
            console.log("All products:", products.length);
        }
    }, [products, product]);

    useEffect(() => {
        const images = Array.isArray(product?.image) ? product.image : [product?.image].filter(Boolean);
        if (images.length > 0) {
            setThumbnail(images[0]);
        }
    }, [product]);

    // Show loading state if products are still loading
    if (products.length === 0) {
        return (
            <div className="mt-12 flex items-center justify-center h-64">
                <p className="text-xl text-gray-500">Loading products...</p>
            </div>
        );
    }

    // Show error if product not found
    if (!product) {
        return (
            <div className="mt-12 flex flex-col items-center justify-center h-64">
                <p className="text-xl text-gray-500">Product not found.</p>
                <p className="text-sm text-gray-400 mt-2">ID: {id}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const productImages = Array.isArray(product.image) ? product.image.filter(Boolean) : [product.image].filter(Boolean);
    const descriptionList = Array.isArray(product.description)
        ? product.description
        : [product.description].filter(Boolean);

    return (
        <div className="mt-12 px-4 md:px-8 max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-600 mb-6">
                <Link to="/" className="hover:text-primary transition">Home</Link> /
                <Link to="/products" className="hover:text-primary transition"> Products</Link> /
                <Link to={`/products/${product.category.toLowerCase()}`} className="hover:text-primary transition"> {product.category}</Link> /
                <span className="text-primary"> {product.name}</span>
            </nav>

            {/* Product Details */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Product Images */}
                <div className="flex flex-col md:flex-row gap-6 w-full lg:w-1/2">
                    {/* Thumbnails */}
                    <div className="flex flex-row md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-visible">
                        {(productImages.length > 0 ? productImages : [assets.upload_area]).map((image, index) => (
                            <div
                                key={index}
                                onClick={() => setThumbnail(image)}
                                className={`border-2 rounded cursor-pointer transition-all min-w-[60px] ${thumbnail === image ? 'border-primary' : 'border-gray-200'
                                    }`}
                            >
                                <img
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-16 h-16 object-contain"
                                    onError={(event) => {
                                        event.currentTarget.src = assets.upload_area;
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Main Image */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden w-full order-1 md:order-2">
                        <img
                            src={thumbnail || productImages[0] || assets.upload_area}
                            alt={product.name}
                            className="w-full h-72 md:h-96 object-contain"
                            onError={(event) => {
                                event.currentTarget.src = assets.upload_area;
                            }}
                        />
                    </div>
                </div>

                {/* Product Info */}
                <div className="w-full lg:w-1/2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{product.name}</h1>

                    {/* Ratings */}
                    <div className="flex items-center gap-1 mt-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <img
                                key={star}
                                src={star <= 4 ? assets.star_icon : assets.star_dull_icon}
                                alt="star"
                                className="w-5 h-5"
                            />
                        ))}
                        <span className="text-sm text-gray-500 ml-2">(4 reviews)</span>
                    </div>

                    {/* Pricing */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        {product.price > (product.offerPrice || product.price) && (
                            <p className="text-gray-500 line-through text-sm">
                                MRP: {currency}{product.price}
                            </p>
                        )}
                        <p className="text-2xl font-bold text-primary">
                            {currency}{product.offerPrice || product.price}
                        </p>
                        <span className="text-sm text-gray-500">Inclusive of all taxes</span>
                    </div>

                    {/* Description */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">About Product</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            {descriptionList.map((desc, index) => (
                                <li key={index}>{desc}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button
                            onClick={() => addToCart(product._id || product.id)}
                            className="flex-1 py-3 px-6 font-medium bg-gray-100 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-200 transition"
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={() => {
                                addToCart(product._id || product.id);
                                navigate("/cart");
                            }}
                            className="flex-1 py-3 px-6 font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Product */}
            <div className='flex flex-col items-center mt-20'>
                <div className='flex flex-col items-center w-max'>
                    <p className='text-3xl font-medium'>Related Products</p>
                    <div className='w-20 h-0.5 bg-primary rounded-full mt-2'></div>
                </div>

                {relatedProducts.length === 0 ? (
                    <p className="text-gray-500 text-center mt-8">Finding related products...</p>
                ) : relatedProducts.filter((product) => product.inStock).length === 0 ? (
                    <p className="text-gray-500 text-center mt-8">No related products available at the moment.</p>
                ) : (
                    <>
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full'>
                            {relatedProducts
                                .filter((product) => product.inStock)
                                .map((product, index) => (
                                    <ProductCard key={`${product._id || product.id}-${index}`} product={product} />
                                ))}
                        </div>
                        <button
                            onClick={() => { navigate('/products'); window.scrollTo(0, 0) }}
                            className='mx-auto cursor-pointer px-12 py-3 my-6 border-2 border-primary rounded-full text-primary font-medium hover:bg-primary hover:text-white transition-all duration-300'
                        >
                            See More Products
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
