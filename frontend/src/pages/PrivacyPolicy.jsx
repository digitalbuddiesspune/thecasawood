import { Link } from 'react-router-dom'

const PrivacyPolicy = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <Link to="/" className="text-[#8b5e3c] hover:underline text-sm font-medium mb-6 inline-block">← Back to Home</Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                <p className="text-gray-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString('en-IN')}</p>

                <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                        <p>The Casawood ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website thecasawood.com and make purchases from us.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
                        <p>We may collect the following types of information:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li><strong>Personal Information:</strong> Name, email address, phone number, shipping and billing addresses when you create an account or place an order.</li>
                            <li><strong>Payment Information:</strong> Payment details are processed securely through Razorpay. We do not store your complete card details on our servers.</li>
                            <li><strong>Usage Data:</strong> Information about how you use our website, including IP address, browser type, and pages visited.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
                        <p>We use your information to:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>Process and fulfill your orders</li>
                            <li>Send order confirmations and shipping updates</li>
                            <li>Respond to your inquiries and provide customer support</li>
                            <li>Send newsletters and promotional offers (if you opt in)</li>
                            <li>Improve our website and services</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
                        <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your payment data is encrypted and handled by our payment processor in compliance with industry standards.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Third-Party Sharing</h2>
                        <p>We may share your information with:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>Payment processors (Razorpay) for transaction processing</li>
                            <li>Shipping and logistics partners for order delivery</li>
                            <li>Service providers who assist in operating our business</li>
                        </ul>
                        <p className="mt-2">We do not sell your personal information to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies</h2>
                        <p>We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can control cookie settings through your browser.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
                        <p>If you have questions about this Privacy Policy or wish to access, correct, or delete your personal data, please contact us at:</p>
                        <p className="mt-2">
                            <strong>Email:</strong> <a href="mailto:thecasawoodofficial@gmail.com" className="text-[#8b5e3c] hover:underline">thecasawoodofficial@gmail.com</a><br />
                            <strong>Phone:</strong> 9156746451<br />
                            <strong>Address:</strong> NEW MANISH NAGAR, NAGPUR
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy
