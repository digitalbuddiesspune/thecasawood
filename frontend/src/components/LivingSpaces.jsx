import React from 'react';
import { Link } from 'react-router-dom';

const LivingSpaces = () => {
    const spaces = [
        {
            title: "Living Room",
            image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=800",
            link: "/products?category=Sofas",
            description: "Centerpieces for your conversations"
        },
        {
            title: "Bedroom Sanctuary",
            image: "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?auto=format&fit=crop&q=80&w=800",
            link: "/products?category=Beds",
            description: "Rest in absolute comfort"
        },
        {
            title: "Dining Areas",
            image: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&q=80&w=800",
            link: "/products?category=Dining",
            description: "Where memories are served"
        }
    ];

    return (
        <section className="w-full bg-white py-16 sm:py-20">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <span className="text-[#8b5e3c] font-bold tracking-widest uppercase mb-2 block">Shop by Room</span>
                        <h2 className="text-3xl sm:text-4xl font-serif text-gray-900">Curate Your Space</h2>
                    </div>
                    <Link to="/products" className="group flex items-center gap-2 text-[#5c4033] font-medium hover:text-[#8b5e3c] transition-colors mt-4 md:mt-0">
                        View All Spaces
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {spaces.map((space, idx) => (
                        <Link to={space.link} key={idx} className="group relative h-[500px] overflow-hidden rounded-sm cursor-pointer">
                            <img
                                src={space.image}
                                alt={space.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                            <div className="absolute bottom-0 left-0 w-full p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-2xl font-bold text-white mb-2">{space.title}</h3>
                                <p className="text-gray-200 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 transform translate-y-2 group-hover:translate-y-0">
                                    {space.description}
                                </p>
                                <span className="inline-block px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white text-sm rounded-full hover:bg-white hover:text-[#5c4033] transition-all">
                                    Explore
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LivingSpaces;
