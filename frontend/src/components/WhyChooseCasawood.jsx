import React from 'react';

const WhyChooseCasawood = () => {
    const reasons = [
        {
            title: 'Solid Wood, Built to Last',
            description: 'Seasoned hardwood frames with strong joinery for everyday durability.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            )
        },
        {
            title: 'Thoughtful Craftsmanship',
            description: 'Precision finishing and detailing that elevates the look and feel of every piece.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: 'Pan-India Support',
            description: 'Reliable delivery and service coverage designed for hassle-free ownership.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
            )
        },
        {
            title: 'Warranty & Easy Care',
            description: 'Clear policies, dependable warranty coverage, and easy post-purchase help.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6l4 2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    return (
        <section className="w-full bg-[#f9f5f1] py-14 sm:py-20">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <span className="text-[#8b5e3c] font-bold tracking-widest uppercase mb-3 block">
                            Why Choose Casawood
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 mb-5 leading-tight">
                            Furniture that feels <span className="italic text-[#5c4033]">right</span>, for years.
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
                            From material selection to finishing, we focus on the details that make furniture comfortable,
                            durable, and beautiful in real Indian homes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {reasons.map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-xl border border-[#8b5e3c]/10 shadow-sm hover:shadow-lg transition-shadow p-6"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#f4f1ee] flex items-center justify-center text-[#8b5e3c] mb-4">
                                    {item.icon}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseCasawood;

