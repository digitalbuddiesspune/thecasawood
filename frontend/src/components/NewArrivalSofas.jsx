import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';

const NewArrivalSofas = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ignore = false;
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await productsAPI.getAll({
                    category: 'Sofas',
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                    limit: 8
                });
                if (!ignore && response.data.success) {
                    setProducts(response.data.data || []);
                }
            } catch (err) {
                if (!ignore) {
                    setProducts([]);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();
        return () => { ignore = true; };
    }, []);

    if (loading || products.length === 0) {
        return null;
    }

    return (
        <section className="w-full bg-white py-12 sm:py-16 border-t border-gray-100">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl md:text-[32px] font-normal text-gray-900 mb-2">
                        New Arrival
                    </h2>
                    <p className="text-sm uppercase tracking-widest text-[#8b5e3c]">Sofas</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link
                            to={`/product/${product._id || product.id}`}
                            key={product._id || product.id}
                            className="group"
                        >
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {product.tag && (
                                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#8b5e3c] text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-sm">
                                            {product.tag}
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">{product.category}</p>
                                        <div className="flex items-center space-x-1">
                                            <svg className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                                            <span className="text-xs text-gray-500 font-medium">{product.rating || 0}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-gray-900 font-serif text-lg mb-3 leading-tight group-hover:text-[#8b5e3c] transition-colors line-clamp-1">
                                        {product.name}
                                    </h3>

                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-[#8b5e3c] font-bold text-lg">₹{product.price.toLocaleString()}</p>
                                        <span className="text-sm font-medium text-[#8b5e3c] hover:text-[#70482d]">View →</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewArrivalSofas;
