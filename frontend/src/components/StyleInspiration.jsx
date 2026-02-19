import React from 'react';
import { Link } from 'react-router-dom';

const StyleInspiration = () => {
    return (
        <section className="w-full bg-[#f9f5f1] py-16 sm:py-24">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Image Side - Composition */}
                    <div className="w-full lg:w-1/2 relative">
                        <div className="w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
                            <img
                                src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1769161917/Neutral_Modern_Furniture_Catalog_Document_100_x_140_px_140_x_100_px_1_eplmno.svg"
                                alt="Modern Living Room"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        {/* Floating Small Image */}
                        <div className="absolute -bottom-10 -right-4 md:-right-10 w-1/2 aspect-square overflow-hidden rounded-xl border-8 border-[#f9f5f1] shadow-2xl hidden sm:block">
                            <img
                                src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1769149205/b1d2e040-e522-409c-a175-e51834a83c0f.png"
                                alt="Detail Shot"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="w-full lg:w-1/2 lg:pl-10 text-center lg:text-left">
                        <h4 className="text-[#8b5e3c] font-bold tracking-widest uppercase mb-4 text-sm">Aesthetics & Comfort</h4>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">
                            Elevate Your <br />
                            <span className="text-[#5c4033] italic">Living Experience</span>
                        </h2>
                        <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Discover furniture that tells a story. Our pieces are crafted not just to fill a space, but to create an atmosphere of warmth, elegance, and timeless beauty. Experience the perfect blend of modern design and traditional craftsmanship.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link to="/products" className="px-8 py-4 bg-[#5c4033] text-white font-medium hover:bg-[#8b5e3c] transition-colors shadow-lg hover:shadow-xl rounded-sm">
                                Explore Collection
                            </Link>
                        </div>

                        <div className="mt-12 grid grid-cols-3 gap-8 border-t border-gray-200 pt-8">
                            <div>
                                <h3 className="text-3xl font-bold text-[#8b5e3c]">100+</h3>
                                <p className="text-sm text-gray-500 mt-1">Premium Products</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-[#8b5e3c]">5k+</h3>
                                <p className="text-sm text-gray-500 mt-1">Happy Customers</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-[#8b5e3c]">100%</h3>
                                <p className="text-sm text-gray-500 mt-1">Quality Assurance</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StyleInspiration;
