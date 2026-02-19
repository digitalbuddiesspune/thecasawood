import { Link } from 'react-router-dom'

const RefundPolicy = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <Link to="/" className="text-[#8b5e3c] hover:underline text-sm font-medium mb-6 inline-block">← Back to Home</Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
                <p className="text-gray-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString('en-IN')}</p>

                <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Overview</h2>
                        <p>The Casawood is committed to customer satisfaction. This Refund Policy explains the conditions under which refunds are processed for orders placed on our website.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Eligibility for Refund</h2>
                        <p>You may be eligible for a refund in the following circumstances:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li><strong>Damaged or defective products:</strong> If you receive a product that is damaged during shipping or has a manufacturing defect, we will arrange a replacement or full refund.</li>
                            <li><strong>Wrong item delivered:</strong> If you receive a product different from what you ordered, we will replace it with the correct item or issue a refund.</li>
                            <li><strong>Order cancellation:</strong> If you cancel your order before it has been shipped, we will process a full refund.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How to Request a Refund</h2>
                        <p>To request a refund:</p>
                        <ol className="list-decimal pl-6 space-y-1 mt-2">
                            <li>Contact us within 7 days of delivery (for damaged/defective items) or before shipment (for cancellations)</li>
                            <li>Email us at <a href="mailto:thecasawoodofficial@gmail.com" className="text-[#8b5e3c] hover:underline">thecasawoodofficial@gmail.com</a> with your order number and reason for refund</li>
                            <li>For damaged items, please attach photos as evidence</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Refund Processing</h2>
                        <p>Refunds for online payments will be credited to the original payment method within 7–10 business days after approval. For Cash on Delivery (COD) orders, refunds will be processed via bank transfer; you will need to provide your bank details.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Non-Refundable Situations</h2>
                        <p>Refunds will not be provided in the following cases:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>Change of mind after delivery (unless within our return window)</li>
                            <li>Minor color or grain variations in wood (natural material characteristic)</li>
                            <li>Custom or made-to-order items, unless defective</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Us</h2>
                        <p>For refund-related queries, reach us at:</p>
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

export default RefundPolicy
