import { Link } from 'react-router-dom'

const TermsConditions = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <Link to="/" className="text-[#8b5e3c] hover:underline text-sm font-medium mb-6 inline-block">← Back to Home</Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
                <p className="text-gray-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString('en-IN')}</p>

                <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                        <p>By accessing and using The Casawood website (thecasawood.com) and services, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our website or services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Use of Our Website</h2>
                        <p>You agree to use our website only for lawful purposes. You must not:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>Use the site in any way that violates applicable laws or regulations</li>
                            <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                            <li>Transmit any malicious code, viruses, or harmful content</li>
                            <li>Use the site to harass, abuse, or harm others</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account Registration</h2>
                        <p>To place orders, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Please notify us immediately of any unauthorized use.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Orders and Payment</h2>
                        <p>By placing an order, you agree to provide accurate and complete information. We reserve the right to refuse or cancel orders at our discretion. Payment must be made at the time of order unless Cash on Delivery (COD) is selected. All prices are in Indian Rupees (INR) and are subject to change without notice.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Product Information</h2>
                        <p>We strive to display product information accurately. However, we do not warrant that product descriptions, images, or pricing are error-free. Natural wood may vary in grain and color. Minor variations from images do not constitute a defect.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
                        <p>All content on this website, including text, images, logos, and design, is the property of The Casawood and is protected by copyright and trademark laws. You may not reproduce, distribute, or use our content without written permission.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
                        <p>The Casawood shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products. Our total liability shall not exceed the amount you paid for the product in question.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contact</h2>
                        <p>For questions about these Terms & Conditions, contact us at:</p>
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

export default TermsConditions
