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
                            <a href="https://www.instagram.com/thecasawood.in?igsh=c3VnY3R4dGgxZ3E4" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#5c4033] flex items-center justify-center hover:bg-[#8b5e3c] transition-colors" aria-label="Instagram">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </a>
                            <a href="https://www.facebook.com/share/175eaej49G/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#5c4033] flex items-center justify-center hover:bg-[#8b5e3c] transition-colors" aria-label="Facebook">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                            <a href="https://wa.me/919156746451?text=Hi!%20I'm%20interested%20in%20The%20Casawood%20furniture.%20Would%20like%20to%20know%20more." target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#5c4033] flex items-center justify-center hover:bg-[#8b5e3c] transition-colors" aria-label="WhatsApp">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            </a>
                        </div>
                    </div>

                    {/* Support - Col 2 */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-6 text-[#d4c4b7] uppercase tracking-wide">Support</h3>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li><Link to="/contact" className="hover:text-[#8b5e3c] transition-colors">Contact Us</Link></li>
                            <li><Link to="/faqs" className="hover:text-[#8b5e3c] transition-colors">FAQs</Link></li>
                        </ul>
                    </div>

                    {/* Legal Pages */}
                    <div className="lg:col-span-3">
                        <h3 className="text-lg font-semibold mb-6 text-[#d4c4b7] uppercase tracking-wide">Legal</h3>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li><Link to="/privacy" className="hover:text-[#8b5e3c] transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-[#8b5e3c] transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/refund" className="hover:text-[#8b5e3c] transition-colors">Refund Policy</Link></li>
                            <li><Link to="/shipping" className="hover:text-[#8b5e3c] transition-colors">Shipping Policy</Link></li>
                        </ul>
                    </div>

                    {/* Office Address */}
                    <div className="lg:col-span-3">
                        <h3 className="text-lg font-semibold mb-6 text-[#d4c4b7] uppercase tracking-wide">Office Address</h3>
                        <p className="text-sm text-gray-300 leading-relaxed mb-1">
                            NEW MANISH NAGAR, NAGPUR
                        </p>
                        <a href="mailto:thecasawoodofficial@gmail.com" className="text-sm text-gray-300 hover:text-[#8b5e3c] transition-colors block mb-1">
                            thecasawoodofficial@gmail.com
                        </a>
                        <a href="tel:9156746451" className="text-sm text-[#8b5e3c] hover:text-[#a67c52] transition-colors">
                            Contact: 9156746451
                        </a>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-[#5c4033] pt-8 flex flex-col md:flex-row justify-center items-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} TheCasaWood. All rights reserved.</p>
                   
                </div>
            </div>
        </footer>
    );
};

export default Footer;
