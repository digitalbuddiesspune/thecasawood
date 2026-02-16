import { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

const OrderSuccess = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        // Optional: Auto-redirect after some time? 
        // For now, let's keep it manual so they see the animation.
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">

                {/* Success Animation */}
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce-slight">
                        <svg className="w-10 h-10 text-green-600 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 mb-8">
                    Thank you for your purchase. Your order has been placed successfully.
                </p>

                <div className="space-y-4">
                    <Link
                        to={`/order/${id}`}
                        className="block w-full py-3 bg-[#8b5e3c] text-white font-bold rounded-lg hover:bg-[#70482d] transition-colors shadow-md transform hover:scale-[1.02] duration-200"
                    >
                        TRACK YOUR ORDER
                    </Link>

                    <Link
                        to="/products"
                        className="block w-full py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        CONTINUE SHOPPING
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes checkmark {
                    0% { stroke-dasharray: 0, 100; opacity: 0; }
                    50% { opacity: 1; }
                    100% { stroke-dasharray: 100, 0; opacity: 1; }
                }
                .animate-checkmark {
                    animation: checkmark 0.8s ease-in-out forwards;
                }
                .animate-bounce-slight {
                    animation: bounce 1s infinite;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    )
}

export default OrderSuccess
