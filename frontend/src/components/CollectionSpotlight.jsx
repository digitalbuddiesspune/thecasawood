import React from 'react';
import { Link } from 'react-router-dom';

const CollectionSpotlight = () => {
    const collections = [
        {
            title: "The Royal Series",
            subtitle: "Luxurious Mahogany Finishes",
            image: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1769148150/f3928a86-9557-4dde-bd48-875650fba8af.png",
            link: "/products?category=Beds"
        },
        {
            title: "Urban Minimalist",
            subtitle: "Sleek Designs for Modern Homes",
            image: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1769148182/b4c4d303-0f27-43ef-a87b-ea296183ea2f.png",
            link: "/products?category=Beds"
        }
    ];

    return (
        <section className="w-full py-16 sm:py-20 bg-white">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Curated Collections</h2>
                    <p className="text-gray-500 mt-2">Handpicked selections for every taste</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {collections.map((col, idx) => (
                        <div key={idx} className="group relative h-[400px] sm:h-[500px] overflow-hidden rounded-2xl cursor-pointer shadow-lg">
                            {/* Background Image */}
                            <img
                                src={col.image}
                                alt={col.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12">
                                <span className="text-white/90 text-sm font-medium tracking-wider uppercase mb-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    Exclusive Collection
                                </span>
                                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">{col.title}</h3>
                                <p className="text-gray-200 text-lg mb-6 max-w-md">{col.subtitle}</p>

                                <Link to={col.link} className="inline-flex items-center gap-2 text-white font-semibold border-b-2 border-white/0 group-hover:border-white w-fit pb-1 transition-all">
                                    Shop Collection
                                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CollectionSpotlight;
