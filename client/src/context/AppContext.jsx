/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "../api";

// -------------------------------------
// CREATE CONTEXT
// -------------------------------------
export const AppContext = createContext();

// -------------------------------------
// PROVIDER COMPONENT
// -------------------------------------
const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY || "INR";

  const [User, setUser] = useState(null);
  const [ShowUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [SearchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Seller state (synced with localStorage)
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
      const { data } = await apiClient.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to fetch products");
    }
  };

  const checkSellerAuth = async () => {
    try {
      const { data } = await apiClient.get("/api/seller/is-auth");
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
      const { data } = await apiClient.get("/api/user/is-auth");
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
    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
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
      if (!User) return;
      
      try {
        const { data } = await apiClient.post("/api/cart/update", {
          userId: User._id,
          cartItems,
        });

        if (!data.success) {
          toast.error(data.message);
        }
      } catch (err) {
        console.error("Cart sync error:", err);
        toast.error(err.response?.data?.message || err.message || "Failed to update cart");
      }
    };

    // Debounce cart updates to avoid too many requests
    const timeoutId = setTimeout(() => {
      if (User) {
        updateCart();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cartItems, User]);

  // -------------------------------------
  // INITIAL LOAD
  // -------------------------------------
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([
          checkSellerAuth(),
          fetchProducts(),
          fetchUser()
        ]);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // -------------------------------------
  // VALUE SHARED TO ALL COMPONENTS
  // -------------------------------------
  const value = {
    // State
    User,
    setUser,
    isSeller,
    setIsSeller,
    ShowUserLogin,
    setShowUserLogin,
    products,
    currency,
    cartItems,
    setCartItems,
    SearchQuery,
    setSearchQuery,
    loading,
    navigate,
    
    // Cart functions
    addToCart,
    updateCartItems,
    removeCartItem,
    getItemCount,
    getCartAmount,
    
    // Other functions
    fetchProducts,
    apiClient,
    // Backwards-compatible alias for existing components
    axios: apiClient,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

// -------------------------------------
// CUSTOM HOOK
// -------------------------------------
const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};

// -------------------------------------
// EXPORT
// -------------------------------------
export { AppContextProvider, useAppContext };
