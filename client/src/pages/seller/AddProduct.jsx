import React, { useState } from 'react'
import { assets, categories } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AddProduct = () => {

    const [files, setFiles] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const { axios, fetchProducts } = useAppContext();
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        console.log('AddProduct onSubmitHandler called', { name, category });
        if (!files.some(Boolean)) {
            toast.error('Please upload at least one product image');
            return;
        }
        setLoading(true);
        const productData = {
            name,
            description,
            category,
            price,
            offerPrice
        }
        const formData = new FormData();
        formData.append('productData', JSON.stringify(productData));
        for (let i = 0; i < files.length; i++) {
            if (files[i]) formData.append('images', files[i]);
        }

        try {
            const { data } = await axios.post('/api/product/add', formData, { timeout: 30000 });
            console.log('AddProduct response', data);
            if (data && data.success) {
                toast.success(data.message || 'Product added');
                setName('');
                setDescription('');
                setCategory('');
                setPrice('');
                setOfferPrice('');
                setFiles([]);
                // Refresh product list so newly added product appears immediately
                try {
                    fetchProducts();
                } catch (err) {
                    console.error('Failed to refresh products after add:', err);
                }
            } else {
                toast.error((data && data.message) || 'Failed to add product');
            }
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                toast.error('Request timed out. Try again.');
                console.error('AddProduct timeout', error);
            } else if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
                console.error('AddProduct server error', error.response.data);
            } else {
                toast.error(error.message || 'An error occurred');
                console.error('AddProduct unknown error', error);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="no-scrollbar overflow-y-scroll h-[95vh] flex-1 flex flex-col justify-between">
            <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-5 max-w-lg">
                <div>
                    <p className="text-base font-medium">Product Image</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        {Array(4).fill('').map((_, index) => (
                            <label key={index} htmlFor={`image${index}`}>
                                <input onChange={(e) => {
                                    const updatedFiles = [...files];
                                    updatedFiles[index] = e.target.files[0];
                                    setFiles(updatedFiles);
                                }}
                                 accept="image/*" type="file" id={`image${index}`} hidden />
                                <img className='max-w-24 cursor-pointer' src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area} alt=''/>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-name">Product Name</label>
                    <input onChange={(e) => setName(e.target.value)} value={name}
                    id="product-name" type="text" placeholder="Type here" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-description">Product Description</label>
                    <textarea onChange={(e) => setDescription(e.target.value)} value={description}
                    id="product-description" rows={4} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder="Type here" required></textarea>
                </div>
                <div className="w-full flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="category">Category</label>
                    <select onChange={(e) => setCategory(e.target.value)} value={category}
                    id="category" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required>
                        <option value="">Select Category</option>
                        {categories.map((items, index) => (
                            <option key={index} value={items.path}>{items.path}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium" htmlFor="product-price">Product Price</label>
                        <input onChange={(e) => setPrice(e.target.value)} value={price}
                        id="product-price" type="number" placeholder="0" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                    </div>
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium" htmlFor="offer-price">Offer Price</label>
                        <input onChange={(e) => setOfferPrice(e.target.value)} value={offerPrice}
                        id="offer-price" type="number" placeholder="0" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                    </div>
                </div>
                <button type="submit" disabled={loading} className="px-8 py-2.5 bg-primary text-white font-medium rounded disabled:opacity-60">{loading ? 'Adding...' : 'ADD'}</button>
            </form>
        </div>
    )
}

export default AddProduct
