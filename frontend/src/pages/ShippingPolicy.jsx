import { Link } from 'react-router-dom'

const ShippingPolicy = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <Link to="/" className="text-[#8b5e3c] hover:underline text-sm font-medium mb-6 inline-block">← Back to Home</Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Policy</h1>
                <p className="text-gray-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString('en-IN')}</p>

                <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Delivery Coverage</h2>
                        <p>The Casawood delivers across Pan India. We ship to all serviceable pincodes. At checkout, you can enter your pincode to confirm delivery availability in your area.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Delivery Time</h2>
                        <p>Estimated delivery time is typically 3–7 business days from the date of order confirmation, depending on your location. Delivery timelines may extend for remote areas or during festive seasons. You will receive tracking details once your order is dispatched.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Delivery Charges</h2>
                        <p>
                            <strong>Free delivery</strong> on orders above ₹50,000.<br />
                            <strong>Flat delivery charge</strong> of ₹500 for orders below ₹50,000.
                        </p>
                        <p className="mt-2">Delivery charges, if applicable, will be shown at checkout before you place your order.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Order Processing</h2>
                        <p>Orders are processed after payment confirmation. For Cash on Delivery (COD) orders, processing begins once the order is confirmed. We will notify you via email/SMS when your order is shipped and provide a tracking link.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Installation</h2>
                        <p>We offer free installation for furniture orders. Our team will contact you to schedule installation at a convenient time. Please ensure someone is available at the delivery address during the scheduled slot.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Delivery Address</h2>
                        <p>Please ensure your delivery address is accurate and complete. Incorrect addresses may lead to delays or failed deliveries. For large furniture items, access to elevators or wide entry points may be required—please mention any special instructions in the order notes.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
                        <p>For shipping-related queries or to track your order, contact us at:</p>
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

export default ShippingPolicy
