import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import GoogleLoginButton from '../components/GoogleLoginButton'

const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, googleLogin } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const from = location.state?.from?.pathname || location.state?.from || '/'

    const validateForm = () => {
        const newErrors = {}

        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            setLoading(true)
            const result = await login(formData.email, formData.password)
            if (result.success) {
                navigate(from, { replace: true })
            } else {
                setErrors({
                    submit: result.message || 'Invalid email or password'
                })
            }
        } catch (error) {
            setErrors({
                submit: 'An unexpected error occurred. Please try again.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex font-sans">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-[#5c4033] flex-col items-center justify-center p-12 text-center text-white relative">
                <div className="max-w-lg z-10">
                    <h1 className="text-6xl font-serif font-bold mb-6 tracking-tight">
                        THECASAWOOD
                    </h1>
                    <p className="text-xl tracking-[0.2em] font-light uppercase border-t border-b border-white/20 py-4">
                        Premium Wooden Furniture
                    </p>
                </div>
                {/* Decorative pattern optimized for performance */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 bg-white lg:bg-[#f9f5f1]">
                <div className="max-w-md w-full bg-white lg:bg-transparent lg:shadow-none shadow-xl rounded-2xl lg:rounded-none p-8 lg:p-0">
                    {/* Header for Mobile only */}
                    <div className="lg:hidden text-center mb-8">
                        <Link to="/" className="inline-block">
                            <h1 className="text-3xl font-serif font-bold text-[#5c4033] mb-1">
                                THECASAWOOD
                            </h1>
                        </Link>
                        <p className="text-xs tracking-widest text-gray-500 uppercase">
                            Premium Wooden Furniture
                        </p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Welcome Back
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Please enter your details to sign in
                        </p>
                    </div>

                    {/* Error Message */}
                    {errors.submit && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-sm">
                            <p className="text-sm text-red-700">
                                {errors.submit}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`block w-full px-4 py-3 border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} rounded-lg focus:ring-2 focus:ring-[#8b5e3c] focus:border-transparent focus:bg-white transition-all text-gray-900 placeholder-gray-400`}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                                <a href="#" className="text-sm font-medium text-[#8b5e3c] hover:text-[#70482d] transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`block w-full px-4 py-3 border ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} rounded-lg focus:ring-2 focus:ring-[#8b5e3c] focus:border-transparent focus:bg-white transition-all text-gray-900 placeholder-gray-400 pr-10`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-[#8b5e3c] hover:bg-[#70482d] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5e3c] disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </button>


                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <GoogleLoginButton
                            onSuccess={async (tokenResponse) => {
                                setLoading(true); // Re-using loading state
                                const result = await googleLogin(tokenResponse.access_token);
                                setLoading(false);
                                if (result.success) {
                                    navigate(from, { replace: true });
                                } else {
                                    setErrors({ submit: result.message });
                                }
                            }}
                            onError={() => setErrors({ submit: 'Google Login Failed' })}
                        />
                    </div>

                    {/* Footer Links */}
                    <div className="mt-8 text-center space-y-4">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-bold text-[#8b5e3c] hover:text-[#70482d] transition-colors">
                                Create an account
                            </Link>
                        </p>

                        <div className="pt-4 border-t border-gray-100">
                            <Link to="/" className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1 group">
                                <svg className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
