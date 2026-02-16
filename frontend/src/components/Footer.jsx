import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-[#3e2b22] text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Newsletter Section */}
                <div className="border-b border-[#5c4033] pb-12 mb-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold text-white mb-2">Subscribe to our Newsletter</h3>
                            <p className="text-gray-400 text-sm">Get the latest updates on new products and upcoming sales</p>
                        </div>
                        <div className="flex w-full md:w-auto gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-[#5c4033] text-white px-4 py-3 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#8b5e3c] w-full md:w-64"
                            />
                            <button className="bg-[#8b5e3c] text-white px-6 py-3 rounded-r-md font-semibold hover:bg-[#a67c52] transition-colors whitespace-nowrap">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12 border-b border-[#5c4033] pb-12">
                    {/* Brand Section - Col 3 */}
                    <div className="lg:col-span-3 space-y-4">
                        <img
                            src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1769077778/Casawood_logo_500x-8_pzbmu9.png"
                            alt="Casawood Logo"
                            className="h-10 w-auto object-contain brightness-0 invert opacity-90"
                        />
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Crafting elegance for your home since 1980. We bring you premium quality wooden furniture that blends tradition with modern design.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            {/* Social Icons */}
                            {['facebook', 'instagram', 'twitter', 'linkedin'].map((social) => (
                                <a
                                    key={social}
                                    href={`#${social}`}
                                    className="w-8 h-8 rounded-full bg-[#5c4033] flex items-center justify-center hover:bg-[#8b5e3c] transition-colors"
                                    aria-label={social}
                                >
                                    <span className="sr-only">{social}</span>
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v-1.293c0-2.005 1.194-3.133 3.022-3.133 0.876 0 1.628 0.065 1.848 0.094v2.144h-1.267c-0.972 0-1.16 0.461-1.16 1.141v1.047h2.384l-0.311 2h-2.073v6z" />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links - Col 2 */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-6 text-[#d4c4b7] uppercase tracking-wide">Quick Links</h3>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li><Link to="/" className="hover:text-[#8b5e3c] transition-colors">Home</Link></li>
                            <li><Link to="/products" className="hover:text-[#8b5e3c] transition-colors">All Products</Link></li>
                            <li><Link to="/products?category=Beds" className="hover:text-[#8b5e3c] transition-colors">Beds</Link></li>
                            <li><Link to="/products?category=Sofas" className="hover:text-[#8b5e3c] transition-colors">Sofas</Link></li>
                            <li><Link to="/products?category=Dining" className="hover:text-[#8b5e3c] transition-colors">Dining</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service - Col 2 */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-6 text-[#d4c4b7] uppercase tracking-wide">Support</h3>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li><a href="#track" className="hover:text-[#8b5e3c] transition-colors">Track Order</a></li>
                            <li><a href="#returns" className="hover:text-[#8b5e3c] transition-colors">Returns</a></li>
                            <li><a href="#shipping" className="hover:text-[#8b5e3c] transition-colors">Shipping</a></li>
                            <li><a href="#contact" className="hover:text-[#8b5e3c] transition-colors">Contact Us</a></li>
                            <li><a href="#faq" className="hover:text-[#8b5e3c] transition-colors">FAQs</a></li>
                        </ul>
                    </div>

                    {/* Mail Us - Col 2.5 */}
                    <div className="lg:col-span-3">
                        <h3 className="text-lg font-semibold mb-6 text-[#d4c4b7] uppercase tracking-wide">Mail Us:</h3>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            Casawood Internet Private Limited,<br />
                            Buildings Alyssa, Begonia &<br />
                            Clove Embassy Tech Village,<br />
                            Outer Ring Road, Devarabeesanahalli Village,<br />
                            Bengaluru, 560103,<br />
                            Karnataka, India
                        </p>
                    </div>

                    {/* Registered Office - Col 2.5 */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-6 text-[#d4c4b7] uppercase tracking-wide">Office</h3>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            Casawood Private Limited,<br />
                            CIN: U51109KA2012PTC066107<br />
                            Telephone: <span className="text-[#8b5e3c]">044-45614700</span>
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-[#5c4033] pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} TheCasaWood. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 opacity-60 grayscale hover:grayscale-0 transition-all" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-60 grayscale hover:grayscale-0 transition-all" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 opacity-60 grayscale hover:grayscale-0 transition-all" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
