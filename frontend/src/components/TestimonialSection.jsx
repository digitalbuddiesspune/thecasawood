import React from 'react';

const TestimonialSection = () => {
    const reviews = [
        {
            id: 1,
            name: "Anjali Mehta",
            location: "Mumbai",
            rating: 5,
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
            text: "The finish on the Sheesham wood bed is absolutely stunning. It has transformed my bedroom completely. The delivery team was also very professional and assembled it in 20 minutes."
        },
        {
            id: 2,
            name: "Rahul Khanna",
            location: "Delhi",
            rating: 5,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
            text: "I was skeptical about buying furniture online, but Casawood exceeded my expectations. The sofa customization options allowed me to get the exact color I wanted for my living room."
        },
        {
            id: 3,
            name: "Priya Sharma",
            location: "Bangalore",
            rating: 4,
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80",
            text: "Great quality dining table. Heavy and sturdy, exactly as described. One star less only because delivery took a couple of days longer than expected, but the product is worth the wait."
        }
    ];

    return (
        <section className="w-full bg-[#fcfcfc] py-16 sm:py-24">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-[#8b5e3c] font-bold tracking-widest uppercase mb-2 block">Testimonials</span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 mb-4">Stories from Indian Homes</h2>
                    <div className="w-20 h-0.5 bg-gray-200 mx-auto"></div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 relative">
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-8 text-[#f0ebe6]">
                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21L14.017 18C14.017 16.0547 14.808 15.6523 15.6484 14.8672C16.8906 13.6875 18.0625 12.0117 17.5156 8.78516C17.3789 7.95703 16.8242 7.55859 16.2734 7.55859C15.9336 7.55859 14.9375 7.64062 14.5469 7.64062C12.1836 7.64062 10.9766 5.86719 11.2305 3.39062C11.332 2.37891 11.9688 1.48828 12.9844 1.48828C14.7383 1.48828 22.0156 3.20312 21.0859 13.9062C20.668 18.7305 17.3789 21 14.017 21ZM6.01562 21L6.01562 18C6.01562 16.0547 6.80859 15.6523 7.64844 14.8672C8.89062 13.6875 10.0625 12.0117 9.51562 8.78516C9.37891 7.95703 8.82422 7.55859 8.27344 7.55859C7.93359 7.55859 6.9375 7.64062 6.54688 7.64062C4.18359 7.64062 2.97656 5.86719 3.23047 3.39062C3.33203 2.37891 3.96875 1.48828 4.98438 1.48828C6.73828 1.48828 14.0156 3.20312 13.0859 13.9062C12.668 18.7305 9.37891 21 6.01562 21Z" />
                                </svg>
                            </div>

                            {/* Stars */}
                            <div className="flex text-[#8b5e3c] mb-6 relative z-10">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>

                            {/* Text */}
                            <p className="text-gray-600 mb-8 italic leading-relaxed relative z-10">"{review.text}"</p>

                            {/* Footer */}
                            <div className="flex items-center gap-4">
                                <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#8b5e3c]/20" />
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                                    <p className="text-gray-400 text-xs">{review.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
