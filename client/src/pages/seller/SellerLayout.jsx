import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from 'react-hot-toast';

const SellerLayout = () => {
    const { setIsSeller , axios} = useAppContext();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate(); // Add navigate for redirect

    const sidebarLinks = [
        { name: "Add Product", path: "/seller", icon: assets.add_icon },
        { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
        { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
    ];

    const logout = async () => {
       try {
        const {data} = await axios.get('/api/seller/logout');
        if(data.success){
            toast.success(data.message);
            navigate("/");
        }
        else{
            toast.error(data.message);   
        }
       } catch (error) {
        toast.error(error.message);   
       }
    }

    return (
        <>
            <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300">
                <Link to="/">
                    <img src={assets.logo} alt="logo" className="cursor-pointer w-34 md:w-38" />
                </Link>
                <div className="flex items-center gap-5 text-gray-500">
                    <p>Hi! Admin</p>
                    <button onClick={logout} className='border rounded-full text-sm px-4 py-1'>
                        Logout
                    </button>
                </div>
            </div>
            <div className="flex">
                {/* Sidebar */}
                <div className={`${isSidebarOpen ? 'md:w-64 w-16' : 'w-16'} border-r border-gray-300 pt-4 flex flex-col transition-all duration-300`}>
                    {sidebarLinks.map((item, index) => (
                        <NavLink
                            to={item.path}
                            key={index}
                            end={item.path === "/seller"}
                            className={({ isActive }) =>
                                `flex items-center py-3 px-4 gap-3 transition-colors duration-200
                                ${isActive
                                    ? "border-r-4 md:border-r-[6px] border-primary bg-blue-50 text-primary font-medium"
                                    : "hover:bg-gray-100 text-gray-700"
                                }`
                            }
                        >
                            <img src={item.icon} alt={item.name} className="w-6 h-6" />
                            <span className={`${isSidebarOpen ? 'md:block hidden' : 'hidden'} transition-all duration-300`}>
                                {item.name}
                            </span>
                        </NavLink>
                    ))}
                </div>

                <Outlet />
            </div>
        </>
    );
};

export default SellerLayout;