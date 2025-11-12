import React, { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast';

const SellerLogin = () => {
    const { isSeller, setIsSeller, navigate, axios } = useAppContext(); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        console.log('SellerLogin onSubmitHandler called', { email });
        setLoading(true);
        try {
            const { data } = await axios.post('/api/seller/login', { email, password });
            if (data.success) {
                setIsSeller(true);
                navigate('/seller');
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            // Prefer server-provided error message when available
            const serverMessage = error?.response?.data?.message;
            toast.error(serverMessage || error?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(isSeller){
            navigate("/seller")
        }
    }, [isSeller, navigate]) 

    return !isSeller && (
        <form onSubmit={onSubmitHandler} className='min-h-screen flex items-center justify-center text-sm text-gray-400 border '>
            <div className='flex flex-col gap-5 m:auto items-start p-8 py-12 min-w-80 md:min-w-88 rounded-lg shadow-xl border border-primary/50'>
                <p className='text-2xl font-medium m-auto'><span className='text-primary'>Seller</span> Login</p>
                <div className='w-full'>
                    <p>Email</p>
                    <input onChange = {(e) => setEmail(e.target.value)} value={email}
                    type='email' placeholder='Enter your email' className='border border-gray-300 rounded w-full p-2 mt-1 outline-primary' required/>
                </div>
                <div className='w-full'>
                    <p>Password</p>
                    <input onChange = {(e) => setPassword(e.target.value)} value={password} 
                    type='password' placeholder='Enter your password' className='border border-gray-300 rounded w-full p-2 mt-1 outline-primary' required/>
                </div>
                <button type="submit" disabled={loading} className='bg-primary text-white w-full py-2 rounded-md cursor-pointer disabled:opacity-60'>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </div>
        </form>
    )
}

export default SellerLogin