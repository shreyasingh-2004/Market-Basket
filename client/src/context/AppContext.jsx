import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from 'axios';

axios.defaults.withCredentials = true;
// ensure no trailing slash or surrounding quotes from env
const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').toString().trim().replace(/\/$/, '');
// In dev use the Vite proxy (same origin) so cookies are set correctly; in prod use explicit backend URL
axios.defaults.baseURL = import.meta.env.DEV ? '' : backendUrl;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();
    const [User, setUser] = useState(null);
    // Initialize isSeller from localStorage
    const [isSeller, setIsSellerState] = useState(() => {
        const stored = localStorage.getItem('isSeller');
        return stored === 'true';
    });
    const [ShowUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [SearchQuery, setSearchQuery] = useState("");

    // Custom setter to sync with localStorage
    const setIsSeller = (value) => {
        setIsSellerState(value);
        localStorage.setItem('isSeller', value);
    }

    // fetching product
    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/api/product/list');
            if (data.success) {
                setProducts(data.products);
            }
            else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    const checkSellerAuth = async () => {
        try {
            const { data } = await axios.get('/api/seller/is-auth');
            if (data?.success && data.user) {
                setIsSeller(true);
            } else {
                setIsSeller(false);
            }
        } catch (err) {
            setIsSeller(false);
        }
    };
    
    // fetch user data and cart item

    const fetchUser = async() => {
        try {
            const { data } = await axios.get('/api/user/is-auth');
             if (data.success ) {
                setUser(data.user);
                setCartItems(data.user.cartItems);
             }
        } catch (error) {
            setUser(null);
        }
    }


    // add product to cart
    const addToCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        toast.success("Added to Cart");
    }

    // update cart items
    const updateCartItems = (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData);
        toast.success("Cart Updated");
    }

    // Remove Product from Cart
    const removeCartItem = (itemId) => {
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] -= 1;
            if (cartData[itemId] === 0) {
                delete cartData[itemId];
            }
        }
        toast.success("Removed from Cart")
        setCartItems(cartData);
    }
    // Get carts item count
    const getItemCount = () => {
        let totalCount = 0;
        for (const item in cartItems) {
            totalCount += cartItems[item];
        }
        return totalCount;
    }

    // Get Cart total price 
    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items]
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        const initializeApp = async () => {
            await checkSellerAuth();
            await fetchProducts();
            await fetchUser();
        };
        initializeApp();
    }, []);

    const value = {
        navigate, User, setUser, setIsSeller, isSeller, ShowUserLogin, setShowUserLogin,
        products, currency, addToCart, updateCartItems, removeCartItem, cartItems, SearchQuery, setSearchQuery, getCartAmount,
        getItemCount, axios, fetchProducts
    }

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = () => {
    return useContext(AppContext);
};