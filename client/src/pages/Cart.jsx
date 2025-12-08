import { useEffect, useState } from "react"
import { useAppContext } from "../context/AppContext"
import { assets, dummyAddress } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

const Cart = () => {
    const { products, currency, cartItems, removeCartItem, getItemCount, 
        updateCartItems, navigate, getCartAmount, User, setCartItems }
    = useAppContext();

    const [cartArray, setCartArray] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [showAddress, setShowAddress] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentOption, setPaymentOption] = useState("COD");

    const getCart = () => {
        let tempArray = [];
        for (const key in cartItems) {
            const product = products.find((items) => items._id === key);
            if (product) {
                product.quantity = cartItems[key];
                tempArray.push(product);
            }
        }
        setCartArray(tempArray);
    }

    const getUserAddress = async() => {
        try {
            const { data } = await axios.get('/api/address/get');
            if(data.success){
                setAddresses(data.addresses);
                if(data.addresses.length > 0){
                    setSelectedAddress(data.addresses[0]);
                }
                else{
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    useEffect(() => {
        if (products.length > 0 && cartItems) {
            getCart();
        }
    }, [products, cartItems])

    useEffect(() => {
        if(User){
            getUserAddress();
        }
    },[User])

    // FIXED: Better cart count calculation
    const calculateCartCount = () => {
        if (!cartItems) return 0;
        return Object.values(cartItems).reduce((total, quantity) => {
            const numQuantity = Number(quantity) || 0;
            return total + numQuantity;
        }, 0);
    }

    // FIXED: Ensure cartCount is always a number
    const cartCount = (typeof getItemCount === 'function' ? getItemCount() : calculateCartCount());
    const numericCartCount = Number(cartCount) || 0;
    
    const cartAmount = getCartAmount ? getCartAmount() : 0;
    const taxAmount = cartAmount * 0.02;
    const totalAmount = cartAmount + taxAmount;


    const placeOrder = async () => {
        try {
            if (!selectedAddress){
                return toast.error("Please select a delivery address");
        }
        //  COD
        if(paymentOption === 'COD'){
            const {data} = await axios.post('/api/order/cod', {
                userId : User._id,
                items: cartArray.map(item =>({ product: item._id, quantity: item.quantity })),
                address: selectedAddress._id,
            })
            if(data.success){
                toast.success(data.message);
                setCartItems({});
                navigate('/my-order');
            }
            else{
                toast.error(data.message);
            }
        }
        else{
            // Stripe
            const {data} = await axios.post('/api/order/stripe', {
                items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
                address: selectedAddress._id,
            });

            if(data.success){
                window.location.replace(data.url)
            }
            else{
                toast.error(data.message);
            }
        }
        }catch (error) {
                toast.error(error.message);
            
        }
        
    }

    if (!products.length || !cartItems) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">🛒</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">Your Cart is Empty</h2>
                    <p className="text-gray-600 mb-8">Add some items to your cart to see them here!</p>
                    <button 
                        onClick={() => navigate("/products")} 
                        className="bg-primary hover:bg-primary-dull text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200"
                    >
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <style jsx>{`
                :root {
                    --color-primary: #4fbf8b;
                    --color-primary-dull: #44ae7c;
                }
                .bg-primary { background-color: var(--color-primary); }
                .bg-primary-dull { background-color: var(--color-primary-dull); }
                .bg-primary-50 { background-color: color-mix(in srgb, var(--color-primary) 10%, white); }
                .text-primary { color: var(--color-primary); }
                .text-primary-dull { color: var(--color-primary-dull); }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section - FIXED: Using numericCartCount */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="text-primary font-medium">{numericCartCount} {numericCartCount === 1 ? 'item' : 'items'}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">Total: {currency}{totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Cart Header - FIXED: Using numericCartCount */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                                        Your Items ({numericCartCount} {numericCartCount === 1 ? 'product' : 'products'})
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Total: {currency}{cartAmount.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="divide-y divide-gray-100">
                                {cartArray.map((product, index) => (
                                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                                        <div className="grid grid-cols-12 gap-4 items-center">
                                            {/* Product Info */}
                                            <div className="col-span-6 flex items-center gap-4">
                                                <div 
                                                    onClick={() => {navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0,0)}}
                                                    className="cursor-pointer w-20 h-20 flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                                                >
                                                    <img 
                                                        className="w-full h-full object-cover" 
                                                        src={product.image[0]} 
                                                        alt={product.name} 
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">Weight: {product.weight || "N/A"}</p>
                                                    <p className="text-sm text-primary font-medium mt-2">
                                                        {currency}{product.offerPrice}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="col-span-2 text-center">
                                                <span className="font-semibold text-gray-900">{currency}{product.offerPrice}</span>
                                            </div>

                                            {/* Quantity */}
                                            <div className="col-span-2 flex justify-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-600">Qty:</span>
                                                    <select 
                                                        onChange={e => updateCartItems(product._id, Number(e.target.value))} 
                                                        value={cartItems[product._id]} 
                                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    >
                                                        {Array.from({ length: Math.max(10, cartItems[product._id] + 5) }, (_, i) => (
                                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Total */}
                                            <div className="col-span-2 flex items-center justify-center gap-3">
                                                <span className="font-bold text-gray-900">
                                                    {currency}{(product.offerPrice * product.quantity).toFixed(2)}
                                                </span>
                                                <button 
                                                    onClick={() => removeCartItem(product._id)} 
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                    title="Remove item"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Continue Shopping */}
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <button 
                                    onClick={() => { navigate("/products"); scrollTo(0,0)}} 
                                    className="group inline-flex items-center gap-2 text-primary hover:text-primary-dull font-medium transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                                {/* FIXED: Using numericCartCount */}
                                <p className="text-sm text-gray-600 mt-1">{numericCartCount} items in cart</p>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Delivery Address */}
                                <div className="mb-6">
                                    <p className="text-sm font-medium uppercase text-gray-600 mb-2">Delivery Address</p>
                                    <div className="relative flex justify-between items-start mt-2">
                                        <p className="text-gray-700 text-sm flex-1">
                                            {selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}` : "No address found"}
                                        </p>
                                        <button 
                                            onClick={() => setShowAddress(!showAddress)} 
                                            className="text-primary hover:text-primary-dull hover:underline cursor-pointer text-sm ml-2"
                                        >
                                            Change
                                        </button>
                                        
                                        {/* Address dropdown */}
                                        {showAddress && (
                                            <div className="absolute top-full left-0 right-0 mt-1 py-1 bg-white border border-gray-300 rounded shadow-lg z-10">
                                                {addresses.map((address, index) => (
                                                    <p 
                                                        key={index}
                                                        onClick={() => {
                                                            setSelectedAddress(address); 
                                                            setShowAddress(false)
                                                        }} 
                                                        className="text-gray-700 p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                    >
                                                        {address.street}, {address.city}, {address.state}
                                                    </p>
                                                ))}
                                                <p 
                                                    onClick={() => navigate('/add-address')} 
                                                    className="text-primary text-center cursor-pointer p-2 hover:bg-primary-50 text-sm font-medium"
                                                >
                                                    Add address
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm font-medium uppercase text-gray-600 mt-6 mb-2">Payment Method</p>
                                    <select 
                                        value={paymentOption}
                                        onChange={e => setPaymentOption(e.target.value)} 
                                        className="w-full border border-gray-300 bg-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="COD">Cash On Delivery</option>
                                        <option value="Online">Online Payment</option>
                                    </select>
                                </div>

                                <hr className="border-gray-300" />

                                {/* Price Breakdown - FIXED: Using numericCartCount */}
                                <div className="text-gray-700 mt-4 space-y-2">
                                    <p className="flex justify-between text-sm">
                                        <span>Price ({numericCartCount} items)</span>
                                        <span>{currency}{cartAmount.toFixed(2)}</span>
                                    </p>
                                    <p className="flex justify-between text-sm">
                                        <span>Shipping Fee</span>
                                        <span className="text-green-600">Free</span>
                                    </p>
                                    <p className="flex justify-between text-sm">
                                        <span>Tax (2%)</span>
                                        <span>{currency}{taxAmount.toFixed(2)}</span>
                                    </p>
                                    <p className="flex justify-between text-lg font-medium mt-3 pt-3 border-t border-gray-200">
                                        <span>Total Amount:</span>
                                        <span className="text-primary">{currency}{totalAmount.toFixed(2)}</span>
                                    </p>
                                </div>

                                {/* Place Order Button */}
                                <button 
                                    onClick={placeOrder} 
                                    className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition-colors duration-200 rounded-lg"
                                >
                                    {paymentOption === 'COD' ? 'Place Order' : 'Proceed to Checkout'}
                                </button>

                                {/* Security Note */}
                                <p className="text-xs text-gray-500 text-center mt-3">
                                    🔒 Your payment information is secure and encrypted
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart