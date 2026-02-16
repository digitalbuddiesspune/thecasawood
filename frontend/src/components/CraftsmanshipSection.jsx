import React from 'react';

const CraftsmanshipSection = () => {
    const qualities = [
        {
            title: "Solid Wood Foundation",
            description: "We use only seasoned, Grade-A solid wood (Teak, Sheesham, and Mahogany) that resists warping and termites, ensuring your furniture lasts for generations.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            title: "Artisanal Joinery",
            description: "No staples or weak nails. Our master carpenters rely on traditional mortise-and-tenon joinery for superior structural integrity and clean aesthetics.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: "Premium Finish",
            description: "Our 7-step polishing process uses Italian polymer coatings that bring out the natural grain of the wood while providing resistance against heat and moisture.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            )
        }
    ];

    return (
        <section className="w-full bg-[#3e2b22] py-12 sm:py-16 text-white overflow-hidden relative">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="wood-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M0 0h100v100H0z" fill="none" />
                        <path d="M0 100c20-20 40 0 60-20s40 0 60-20" stroke="currentColor" fill="none" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#wood-pattern)" />
                </svg>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-center">

                    {/* Content */}
                    <div className="w-full lg:w-1/2">
                        <span className="text-[#a67c52] font-bold tracking-widest uppercase mb-2 block">Our Promise</span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif mb-6">
                            Uncompromising <br />
                            <span className="italic text-[#d4c4b7]">Craftsmanship</span>
                        </h2>
                        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                            At Casawood, a piece of furniture is not just an object; it is a labor of love. We combine age-old woodworking traditions with modern precision to create pieces that stand the test of time.
                        </p>

                        <div className="space-y-8">
                            {qualities.map((item, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#5c4033] border border-[#8b5e3c]/30 flex items-center justify-center text-[#d4c4b7]">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-medium text-[#d4c4b7] mb-2">{item.title}</h4>
                                        <p className="text-gray-400 text-sm leading-relaxed max-w-md">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Composition */}
                    <div className="w-full lg:w-1/2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 mt-8">
                                <img
                                    src="https://images.unsplash.com/photo-1611486212557-88be5ff6f941?auto=format&fit=crop&q=80&w=600"
                                    alt="Woodworking Detail"
                                    className="w-full h-56 object-cover rounded-sm opacity-90 hover:opacity-100 transition-opacity"
                                />
                                <div className="bg-[#5c4033] p-5 rounded-sm border border-[#8b5e3c]/20">
                                    <div className="text-3xl font-bold text-[#a67c52] mb-1">10+</div>
                                    <div className="text-sm text-gray-300">Years Warranty on <br />Structural Integrity</div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-[#5c4033] p-5 rounded-sm border border-[#8b5e3c]/20 h-36 flex items-center justify-center text-center">
                                    <span className="font-serif italic text-xl text-[#d4c4b7]">"Quality is not an act, it is a habit."</span>
                                </div>
                                <img
                                    src="https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=600"
                                    alt="Polishing Process"
                                    className="w-full h-72 object-cover rounded-sm opacity-90 hover:opacity-100 transition-opacity"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default CraftsmanshipSection;
