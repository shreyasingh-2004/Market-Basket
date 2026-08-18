import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const MainBanner = () => {
  return (
    <section className="relative" aria-label="Main promotional banner">
      {/* Responsive images with lazy loading */}
      <picture>
        <source media="(min-width: 768px)" srcSet={assets.main_banner_bg} />
        <img 
          src={assets.main_banner_bg_sm} 
          alt="Fresh groceries display with fruits and vegetables" 
          className="w-full h-auto object-cover min-h-[300px] md:min-h-[400px] lg:min-h-[500px]"
          loading="eager"
          width="1200"
          height="500"
        />
      </picture>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center md:items-start justify-end md:justify-center pb-16 md:pb-0 px-4 md:pl-18 lg:pl-24 xl:pl-32">
        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center md:text-left max-w-xs md:max-w-md lg:max-w-2xl text-gray-900 leading-tight md:leading-snug lg:leading-tight drop-shadow-sm">
          Store You Can Trust, Grocery You Can Love!
        </h1>

        <div className="flex flex-col sm:flex-row items-center mt-6 md:mt-8 gap-4 font-medium">
          <Link 
            to="/products" 
            className="group flex items-center justify-center gap-2 px-7 md:px-9 py-3 bg-primary hover:bg-primary-dull transition-all duration-300 rounded-lg text-white cursor-pointer shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-opacity-50 focus:outline-none"
            aria-label="Shop now"
          >
            Shop Now
            <img 
              className="transition-transform duration-300 group-hover:translate-x-1" 
              src={assets.white_arrow_icon} 
              alt="" 
              aria-hidden="true"
              width="16"
              height="16"
            />
          </Link>
          
          <Link 
            to="/products" 
            className="group flex items-center justify-center gap-2 px-7 md:px-9 py-3  bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 rounded-lg text-gray-800 cursor-pointer shadow-sm hover:shadow-md focus:ring-2 focus:ring-gray-300 focus:outline-none"
            aria-label="Explore deals"
          >
            Explore deals
            <img 
              className="transition-transform duration-300 group-hover:translate-x-1" 
              src={assets.black_arrow_icon} 
              alt="" 
              aria-hidden="true"
              width="16"
              height="16"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MainBanner;