import { useState } from 'react';
import { Link } from 'react-router-dom';

const faqList = [
    {
        q: 'How can I track my order?',
        a: 'Once your order is shipped, you will receive an email and SMS with a tracking link. You can also log in to your account, go to Orders, and click on the order to view its status and tracking details.'
    },
    {
        q: 'What is your return and refund policy?',
        a: 'We allow cancellations free of charge within the first 24 hours of placing the order. For returns and refunds after delivery, please refer to our Refund Policy page. Defective or damaged items are covered under our warranty and we will arrange replacement or refund as applicable.'
    },
    {
        q: 'What are your shipping and delivery options?',
        a: 'We deliver Pan India. Delivery typically takes 3–7 business days from order confirmation. Orders above ₹50,000 qualify for free delivery; orders below have a flat delivery charge of ₹500. Installation is included for furniture. Check the Shipping Policy page for full details.'
    },
    {
        q: 'How do I place an order?',
        a: 'Browse our products, add items to the cart, and proceed to checkout. You can pay via card, UPI, net banking, or Cash on Delivery (where available). After payment confirmation, you will receive an order confirmation email.'
    },
    {
        q: 'Can I change or cancel my order?',
        a: 'You can cancel your order free of charge within 24 hours of placing it. After that, please contact us as soon as possible—we will try to accommodate changes if the order has not yet been dispatched.'
    },
    {
        q: 'Do you offer warranty on furniture?',
        a: 'Yes. We offer a 1 year manufacturing warranty on our furniture. Please refer to the product page and our Terms & Conditions for warranty details.'
    },
    {
        q: 'How can I contact customer support?',
        a: 'You can reach us by email at thecasawoodofficial@gmail.com, by phone at 9156746451, or via WhatsApp. Visit our Contact Us page for all details.'
    }
];

const FAQItem = ({ question, answer, isOpen, onToggle }) => (
    <div className="border-b border-gray-200 last:border-0 px-4 sm:px-6">
        <button
            type="button"
            onClick={onToggle}
            className="w-full py-4 flex justify-between items-center text-left font-medium text-gray-900 hover:text-[#8b5e3c] transition-colors"
        >
            <span>{question}</span>
            <span className={`shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-[#8b5e3c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </span>
        </button>
        {isOpen && (
            <div className="pb-4 text-gray-600 text-sm leading-relaxed">
                {answer}
            </div>
        )}
    </div>
);

const FAQs = () => {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <Link to="/" className="text-[#8b5e3c] hover:underline text-sm font-medium mb-6 inline-block">← Back to Home</Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
                <p className="text-gray-500 text-sm mb-10">Quick answers to common questions about orders, shipping, returns, and more.</p>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {faqList.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.q}
                            answer={faq.a}
                            isOpen={openIndex === index}
                            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                        />
                    ))}
                </div>

                <p className="mt-8 text-gray-600 text-sm">Still have questions? <Link to="/contact" className="text-[#8b5e3c] hover:underline font-medium">Contact us</Link> and we’ll be happy to help.</p>
            </div>
        </div>
    );
};

export default FAQs;
