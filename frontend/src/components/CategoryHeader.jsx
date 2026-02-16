import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { categoriesAPI } from '../services/api'

// Fallback nav links if API fails
export const navLinksFallback = [
    { name: 'Beds', to: '/products?category=Beds' },
    { name: 'Coffee & Center Tables', to: '/products?category=Coffee%20%26%20Center%20Tables' },
    { name: 'Dining Tables', to: '/products?category=Dining%20Tables' },
    { name: 'Sofas', to: '/products?category=Sofas' },
    { name: 'Lounge chair', to: '/products?category=Lounge%20chair' },
]

// Hook for fetching nav categories - use in both CategoryHeader and Navbar
export function useNavCategories() {
    const [navLinks, setNavLinks] = useState(navLinksFallback)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoriesAPI.getNavbarCategories()
                if (res.data.success && res.data.data?.length > 0) {
                    setNavLinks(res.data.data)
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err)
            }
        }
        fetchCategories()
    }, [])

    return navLinks
}

const CategoryHeader = ({ activeLink, setActiveLink }) => {
    const navLinks = useNavCategories()

    return (
        <div className="py-2 overflow-x-auto no-scrollbar bg-white shadow-sm border-t border-gray-100">
            <div className="max-w-[1600px] mx-auto px-2 md:px-4 flex items-center justify-start lg:justify-center min-w-max gap-1.5 sm:gap-6">
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        to={link.to}
                        onClick={() => setActiveLink(link.name)}
                        className={`text-[11px] sm:text-xs font-bold tracking-wider uppercase whitespace-nowrap px-2 sm:px-3 py-1.5 rounded-full transition-all duration-200 border ${activeLink === link.name
                            ? 'text-[#8b5e3c] border-[#8b5e3c] bg-[#8b5e3c]/5'
                            : 'text-gray-700 border-transparent hover:text-[#8b5e3c] hover:bg-gray-50'
                            }`}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default CategoryHeader
