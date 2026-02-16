import React from 'react';
import { Link } from 'react-router-dom';

const Lookbook = () => {
    const looks = [
        {
            title: "Nordic Calm",
            description: "Clean lines and light wood for a serene atmosphere.",
            image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800",
            link: "/products"
        },
        {
            title: "Industrial Chic",
            description: "Raw textures and dark wood meeting metal accents.",
            image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800",
            link: "/products"
        },
        {
            title: "Bohemian Rhapsody",
            description: "Layered textures and organic wooden forms.",
            image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800",
            link: "/products"
        }
    ];

    return (
        <section className="w-full bg-white py-16 sm:py-20 border-b border-gray-100">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10">
                    <div>
                        <span className="text-[#8b5e3c] font-bold tracking-widest uppercase mb-2 block">Curated Styles</span>
                        <h2 className="text-3xl sm:text-4xl font-serif text-gray-900">The 2026 Lookbook</h2>
                    </div>
                    <Link to="/products" className="text-[#5c4033] border-b border-[#5c4033] pb-0.5 hover:text-[#8b5e3c] hover:border-[#8b5e3c] transition-colors mt-4 md:mt-0 font-medium">
                        View All Collections
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {looks.map((look, idx) => (
                        <div key={idx} className="group relative overflow-hidden">
                            <div className="aspect-[3/4] overflow-hidden rounded-sm">
                                <img
                                    src={look.image}
                                    alt={look.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                            </div>

                            <div className="absolute bottom-0 left-0 w-full p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-2xl font-serif mb-2">{look.title}</h3>
                                <p className="text-white/90 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                    {look.description}
                                </p>
                                <Link to={look.link} className="inline-flex items-center text-sm font-bold uppercase tracking-wide border-b border-white pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200 hover:text-[#8b5e3c] hover:border-[#8b5e3c]">
                                    Discover
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Lookbook;
