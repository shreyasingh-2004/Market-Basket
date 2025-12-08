import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { statesAndCities, pincodeData } from '../data/addressData';
import { assets } from '../assets/assets';

const InputField = ({ type, placeholder, name, handleChange, value }) => (
    <input
        className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline text-gray-500 focus:border-primary transition'
        type={type}
        placeholder={placeholder}
        onChange={handleChange}
        name={name}
        value={value || ''}
        required
    />
);

const AddAddress = () => {
    const { axios, User, navigate } = useAppContext();
    const [address, setAddress] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        state: '',
        city: '',
        zipcode: '',
        phone: '',
    });

    const [cities, setCities] = useState([]);

    // Handle field changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setAddress((prev) => ({ ...prev, [name]: value }));

        // Update city list if state changes
        if (name === 'state') {
            setCities(statesAndCities[value] || []);
            setAddress((prev) => ({ ...prev, city: '' }));
        }

        // Auto-fill state + city based on ZIP
        if (name === 'zipcode' && value.length >= 6) {
            const zipInfo = pincodeData[value];
            if (zipInfo) {
                setAddress((prev) => ({
                    ...prev,
                    state: zipInfo.state,
                    city: zipInfo.city,
                    zipcode: value,
                }));
                setCities(statesAndCities[zipInfo.state] || []);
            }
        }
    };

    // Submit form
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/address/add', { address });
            if (data.success) {
                toast.success(data.message);
                navigate('/cart');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Redirect if user not logged in
    useEffect(() => {
        if (!User) navigate('/cart');
    }, []);

    return (
        <div className='mt-16 pb-16'>
            <p className='text-2xl md:text-3xl text-gray-500'>
                Add Shipping <span className='font-semibold text-primary'>Address</span>
            </p>
            <div className='flex flex-col-reverse md:flex-row justify-between mt-10'>
                <div className='flex-1 max-w-md'>
                    <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>
                        <div className='grid grid-cols-2 gap-4'>
                            <InputField
                                handleChange={handleChange}
                                value={address.firstName}
                                name='firstName'
                                type='text'
                                placeholder='First Name'
                            />
                            <InputField
                                handleChange={handleChange}
                                value={address.lastName}
                                name='lastName'
                                type='text'
                                placeholder='Last Name'
                            />
                        </div>
                        <InputField
                            handleChange={handleChange}
                            value={address.email}
                            name='email'
                            type='email'
                            placeholder='Email ID'
                        />
                        <InputField
                            handleChange={handleChange}
                            value={address.street}
                            name='street'
                            type='text'
                            placeholder='Street'
                        />
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className='block mb-1 text-gray-500'>State</label>
                                <select
                                    name='state'
                                    value={address.state}
                                    onChange={handleChange}
                                    className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline text-gray-500 focus:border-primary transition'
                                    required
                                >
                                    <option value=''>Select State</option>
                                    {Object.keys(statesAndCities).map((state) => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className='block mb-1 text-gray-500'>City</label>
                                <select
                                    name='city'
                                    value={address.city}
                                    onChange={handleChange}
                                    className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline text-gray-500 focus:border-primary transition'
                                    required
                                >
                                    <option value=''>Select City</option>
                                    {cities.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <InputField
                            handleChange={handleChange}
                            value={address.zipcode}
                            name='zipcode'
                            type='number'
                            placeholder='ZIP Code'
                        />
                        <InputField
                            handleChange={handleChange}
                            value={address.phone}
                            name='phone'
                            type='text'
                            placeholder='Phone'
                        />
                        <button
                            type='submit'
                            className='w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer uppercase'
                        >
                            Save Address
                        </button>
                    </form>
                </div>
                <img
                    className='md:mr-16 mb-16 md:mt-0'
                    src={assets.add_address_iamge}
                    alt='AddAddress'
                />
            </div>
        </div>
    );
};

export default AddAddress;
