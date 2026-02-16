import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Profile = () => {
    const { isAuthenticated, user, logout, updateUser } = useAuth()
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    })
    const [updateLoading, setUpdateLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || ''
            })
        }
    }, [user])

    useEffect(() => {
        setLoading(false)
    }, [isAuthenticated])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5e3c]"></div>
            </div>
        )
    }

    // Show login prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
                <div className="text-center max-w-md px-4 w-full">
                    <div className="mb-6">
                        <svg className="w-24 h-24 sm:w-32 sm:h-32 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Please Login</h2>
                    <p className="text-gray-500 mb-6 text-sm sm:text-base">Login to view your profile and manage your account</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/login"
                            className="w-full sm:w-auto inline-block px-8 py-3 bg-[#8b5e3c] text-white font-semibold rounded-lg hover:bg-[#70482d] transition-colors shadow-md hover:shadow-lg text-center"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="w-full sm:w-auto inline-block px-8 py-3 border-2 border-[#8b5e3c] text-[#8b5e3c] font-semibold rounded-lg hover:bg-[#8b5e3c] hover:text-white transition-colors text-center"
                        >
                            Sign Up
                        </Link>
                    </div>
                    <Link to="/" className="inline-block mt-6 text-sm text-gray-600 hover:text-gray-900">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-100 min-h-screen py-6">
            <div className="max-w-[1200px] mx-auto px-4">
                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                            <div className="relative">
                                <div className="w-20 h-20 bg-[#8b5e3c] rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0 ring-4 ring-gray-50">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <button className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-gray-100 text-gray-500 hover:text-[#8b5e3c]">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user?.name || 'User'}</h1>
                                <p className="text-gray-600 text-sm sm:text-base mb-1">{user?.email || 'user@example.com'}</p>
                                <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                    Gold Member
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                            >
                                Edit Profile
                            </button>
                            <button
                                onClick={logout}
                                className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm sm:text-base"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                    {/* Left Column - Quick Links */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link to="/orders" className="bg-[#8b5e3c] rounded-xl p-4 sm:p-6 text-white shadow-lg shadow-orange-900/10 hover:shadow-xl hover:translate-y-[-2px] transition-all relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">My Orders</h3>
                                        <p className="text-orange-100 text-sm">Check order status</p>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/cart" className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#8b5e3c]/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">My Cart</h3>
                                        <p className="text-gray-500 text-sm">View items in cart</p>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Recent Actions Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Link to="/wishlist" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md text-center group hover:border-pink-200 transition-all">
                                <div className="w-10 h-10 mx-auto bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-pink-100 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <span className="block text-sm font-medium text-gray-700">Wishlist</span>
                            </Link>
                            <Link to="/address" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md text-center group hover:border-green-200 transition-all">
                                <div className="w-10 h-10 mx-auto bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="block text-sm font-medium text-gray-700">Addresses</span>
                            </Link>
                        </div>

                        {/* Settings & Preferences */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-semibold text-gray-900">Settings & Preferences</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <Link to="/notifications" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                        </div>
                                        <span className="text-gray-700 font-medium text-sm">Notifications</span>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </Link>
                                <Link to="/security" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                        <span className="text-gray-700 font-medium text-sm">Privacy & Security</span>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Account Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 sticky top-24 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-[#8b5e3c] text-sm font-medium hover:underline"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {isEditing ? (
                                    <form onSubmit={async (e) => {
                                        e.preventDefault()
                                        try {
                                            setUpdateLoading(true)
                                            const response = await usersAPI.updateProfile(formData)
                                            if (response.data.success) {
                                                updateUser(response.data.user) // Update context
                                                setIsEditing(false)
                                            }
                                        } catch (error) {
                                            alert(error.response?.data?.message || 'Failed to update profile')
                                        } finally {
                                            setUpdateLoading(false)
                                        }
                                    }} className="space-y-6">
                                        <div className="group">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full p-3 border border-[#8b5e3c] rounded-lg focus:ring-1 focus:ring-[#8b5e3c] outline-none bg-white"
                                                required
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Email Address</label>
                                            <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                <p className="font-medium text-sm break-all">{user?.email}</p>
                                                <span className="text-xs ml-auto">(Read Only)</span>
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full p-3 border border-[#8b5e3c] rounded-lg focus:ring-1 focus:ring-[#8b5e3c] outline-none bg-white"
                                                placeholder="Add phone number"
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false)
                                                    setFormData({ name: user.name || '', phone: user.phone || '' })
                                                }}
                                                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                                                disabled={updateLoading}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 py-2 bg-[#8b5e3c] text-white rounded-lg hover:bg-[#70482d] font-bold"
                                                disabled={updateLoading}
                                            >
                                                {updateLoading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="group">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                <p className="font-medium text-gray-900 text-sm break-words">{user?.name || 'Not provided'}</p>
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Email Address</label>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                <p className="font-medium text-gray-900 text-sm break-all">{user?.email || 'Not provided'}</p>
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Phone Number</label>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                <p className="font-medium text-gray-900 text-sm">{user?.phone || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span>Member Since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
