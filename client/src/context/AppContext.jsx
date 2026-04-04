import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;

// Backend URL handling
const backendUrl = (import.meta.env.VITE_BACKEND_URL || "")
  .toString()
  .trim()
  .replace(/\/$/, "");

axios.defaults.baseURL = import.meta.env.DEV ? "" : backendUrl;

// -------------------------------------
// CREATE CONTEXT
// -------------------------------------
export const AppContext = createContext();

// -------------------------------------
// PROVIDER COMPONENT
// -------------------------------------
const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;

  const [User, setUser] = useState(null);
  const [ShowUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [SearchQuery, setSearchQuery] = useState("");

  // seller state (synced with localStorage)
  const [isSeller, setIsSellerState] = useState(() => {
    return localStorage.getItem("isSeller") === "true";
  });

  const setIsSeller = (value) => {
    setIsSellerState(value);
    localStorage.setItem("isSeller", value);
  };

  // -------------------------------------
  // API CALLS
  // -------------------------------------

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const checkSellerAuth = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      setIsSeller(data?.success && data.user ? true : false);
    } catch (err) {
      // 401 is expected when no seller token exists; suppress console spam
      if (err.response?.status !== 401) {
        console.warn("checkSellerAuth error:", err.message);
      }
      setIsSeller(false);
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      }
    } catch (err) {
      // 401 is expected when no user token exists; suppress console spam
      if (err.response?.status !== 401) {
        console.warn("fetchUser error:", err.message);
      }
      setUser(null);
    }
  };

  // -------------------------------------
  // CART FUNCTIONS
  // -------------------------------------

  const addToCart = (itemId) => {
    const cartData = { ...cartItems };
    cartData[itemId] = (cartData[itemId] || 0) + 1;

    setCartItems(cartData);
    toast.success("Added to Cart");
  };

  const updateCartItems = (itemId, quantity) => {
    const cartData = { ...cartItems };
    cartData[itemId] = quantity;

    setCartItems(cartData);
    toast.success("Cart Updated");
  };

  const removeCartItem = (itemId) => {
    const cartData = { ...cartItems };

    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }

    setCartItems(cartData);
    toast.success("Removed from Cart");
  };

  const getItemCount = () => {
    return Object.values(cartItems).reduce((sum, item) => sum + item, 0);
  };

  const getCartAmount = () => {
    let total = 0;

    for (const id in cartItems) {
      const product = products.find((p) => p._id === id);
      if (product) {
        total += product.offerPrice * cartItems[id];
      }
    }

    return Math.floor(total * 100) / 100;
  };

  // -------------------------------------
  // SYNC CART BACKEND WHEN cartItems CHANGES
  // -------------------------------------
  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", {
          userId: User?._id,
          cartItems,
        });

        if (!data.success) toast.error(data.message);
      } catch (err) {
        toast.error(err.message);
      }
    };

    if (User) updateCart();
  }, [cartItems]);

  // -------------------------------------
  // INITIAL LOAD
  // -------------------------------------
  useEffect(() => {
    const init = async () => {
      await checkSellerAuth();
      await fetchProducts();
      await fetchUser();
    };
    init();
  }, []);

  // -------------------------------------
  // VALUE SHARED TO ALL COMPONENTS
  // -------------------------------------
  const value = {
    navigate,
    User,
    setUser,
    isSeller,
    setIsSeller,
    ShowUserLogin,
    setShowUserLogin,
    products,
    currency,
    addToCart,
    updateCartItems,
    removeCartItem,
    cartItems,
    SearchQuery,
    setSearchQuery,
    getCartAmount,
    getItemCount,
    axios,
    fetchProducts,
    setCartItems
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

// -------------------------------------
// CUSTOM HOOK
// -------------------------------------
const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return ctx;
};

// -------------------------------------
// EXPORT (NO DUPLICATE EXPORTS)
// -------------------------------------
export { AppContextProvider, useAppContext };
