const PoliciesSection = () => {
    const policies = [
        {
            icon: (
                <svg className="w-12 h-12 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                    <text x="50%" y="45%" dominantBaseline="middle" textAnchor="middle" fontSize="11" fontWeight="bold">3.2</text>
                    <text x="50%" y="75%" dominantBaseline="middle" textAnchor="middle" fontSize="8">Mn</text>
                </svg>
            ),
            title: '3.2 Million',
            subtitle: 'Happy Customers'
        },
        {
            icon: (
                <svg className="w-12 h-12 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
            ),
            title: '4 Decades',
            subtitle: 'Experience'
        },
        {
            icon: (
                <svg className="w-12 h-12 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">5</text>
                </svg>
            ),
            title: 'Unmatched',
            subtitle: '5 Years Warranty'
        },
        {
            icon: (
                <svg className="w-12 h-12 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
            ),
            title: 'Pan India',
            subtitle: 'Presence'
        },
        {
            icon: (
                <svg className="w-12 h-12 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
            ),
            title: 'Free',
            subtitle: 'Installation'
        },
        {
            icon: (
                <svg className="w-12 h-12 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                    <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" fontSize="18" fontWeight="bold">0%</text>
                </svg>
            ),
            title: 'EMIs On',
            subtitle: 'Furniture'
        }
    ]

    return (
        <section className="w-full bg-gray-50 py-8 sm:py-10 md:py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Title */}
                <div className="text-center mb-8 sm:mb-10 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-900 mb-2 sm:mb-3">
                        Top Notch Policies
                    </h2>
                    <div className="w-24 sm:w-32 h-0.5 sm:h-1 bg-[#8b5e3c] mx-auto"></div>
                </div>

                {/* Policies Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
                    {policies.map((policy, index) => (
                        <div key={index} className="flex flex-col items-center text-center px-2 sm:px-0 transition-transform duration-300 hover:scale-110 cursor-pointer">
                            {/* Icon */}
                            <div className="mb-2 sm:mb-3 md:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto flex items-center justify-center">
                                    {policy.icon}
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-800 mb-1 sm:mb-0.5 leading-tight">
                                {policy.title}
                            </h3>

                            {/* Subtitle */}
                            <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 leading-tight">
                                {policy.subtitle}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default PoliciesSection
