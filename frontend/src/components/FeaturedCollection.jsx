import React from 'react';
import { Link } from 'react-router-dom';

const FeaturedCollection = () => {
    const features = [
        {
            id: 1,
            title: 'Premium Sofas & Recliners',
            category: 'Sofas',
            price: '34,999',
            image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1769152582/Photo_Home_Design_Elegant_Instagram_Post_1080_x_1080_px_90_x_140_px_80_x_140_px_100_x_140_px_1_n9jgom.svg',
        },
        {
            id: 2,
            title: 'Cosy Beds',
            category: 'Beds',
            price: '21,999',
            image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1769152425/Green_and_White_Elegant_Bedroom_Design_Instagram_Post_100_x_140_px_1_ofg75r.svg',
        },
        {
            id: 3,
            title: 'Timeless Dining',
            category: 'Dining',
            price: '41,000',
            image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1769152881/Brown_Simple_Minimalist_Aesthetic_Dining_Table_Instagram_Post_2_l4aikc.svg',
        },
        {
            id: 4,
            title: 'Modern Living',
            category: 'Sofas',
            price: '15,999',
            image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1769152203/Brown_Neutral_Modern_Wooden_Furniture_Instagram_Post_100_x_140_px_5_sj1kyl.svg',
        },
    ];

    return (
        <section className="w-full bg-white py-12 sm:py-16">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-10 sm:mb-14">
                    <h2 className="text-2xl sm:text-3xl md:text-[32px] font-normal text-gray-900 mb-4">
                        Featured Now
                    </h2>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#8b5e3c] mx-auto"></div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {features.map((item) => (
                        <Link to={`/products?category=${item.category}`} key={item.id} className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-2xl mb-4">
                                {/* Image */}
                                <div className="aspect-[3/5] overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />


                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-medium text-gray-800 group-hover:text-[#8b5e3c] transition-colors text-center">
                                {item.title}
                            </h3>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedCollection;
