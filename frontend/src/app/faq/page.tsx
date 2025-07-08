'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, ShoppingBag, Truck, CreditCard, Shield, Users } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  // Shopping & Products
  {
    id: '1',
    question: 'What types of traditional dresses do you offer?',
    answer: 'We offer a wide range of authentic Nepali traditional dresses including Saaris, Kurta Suruwals, Daura Suruwals, Dhimal Dresses, and various other traditional garments. Each piece is handcrafted by skilled Nepali artisans.',
    category: 'shopping'
  },
  {
    id: '2',
    question: 'Are your products authentic Nepali traditional wear?',
    answer: 'Yes, all our products are authentic Nepali traditional wear. We work directly with skilled artisans from Nepal who use traditional techniques and materials to create each piece. Every garment tells a story of Nepali culture and heritage.',
    category: 'shopping'
  },
  {
    id: '3',
    question: 'Do you offer different sizes?',
    answer: 'Yes, we offer various sizes to accommodate different body types. Our size guide helps you find the perfect fit. If you need custom sizing, please contact us and we\'ll work with our artisans to create a piece that fits you perfectly.',
    category: 'shopping'
  },
  {
    id: '4',
    question: 'Can I customize the colors or design?',
    answer: 'Yes, we offer customization options for many of our pieces. You can request specific colors, patterns, or modifications. Custom orders may take 2-4 weeks to complete. Contact us for more details about customization.',
    category: 'shopping'
  },
  // Shipping & Delivery
  {
    id: '5',
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 7-14 business days within Australia. Express shipping (2-5 business days) is available for an additional fee. International shipping times vary by location. You\'ll receive tracking information once your order ships.',
    category: 'shipping'
  },
  {
    id: '6',
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. You can see the shipping cost during checkout. We use reliable international carriers to ensure safe delivery.',
    category: 'shipping'
  },
  {
    id: '7',
    question: 'Is shipping free?',
    answer: 'We offer free standard shipping on orders over $100 within Australia. For orders under $100, standard shipping is $9.95. Express shipping is available for $19.95. International shipping rates are calculated at checkout.',
    category: 'shipping'
  },
  {
    id: '8',
    question: 'How can I track my order?',
    answer: 'Once your order ships, you\'ll receive an email with tracking information. You can also track your order by logging into your account and visiting the order history section. If you have any issues, contact our customer service.',
    category: 'shipping'
  },
  // Payment & Security
  {
    id: '9',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. We also offer cash on delivery for orders within Australia. All payments are processed securely through our payment partners.',
    category: 'payment'
  },
  {
    id: '10',
    question: 'Is my payment information secure?',
    answer: 'Yes, we use industry-standard SSL encryption to protect your payment information. We never store your credit card details on our servers. All payments are processed through secure, PCI-compliant payment gateways.',
    category: 'payment'
  },
  {
    id: '11',
    question: 'Do you offer payment plans?',
    answer: 'Currently, we offer Afterpay for eligible orders over $35. This allows you to pay in 4 interest-free installments. Afterpay is available for Australian customers only. Other payment plans may be available upon request.',
    category: 'payment'
  },
  // Returns & Exchanges
  {
    id: '12',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for most items. Items must be unworn, unwashed, and in original condition with all tags attached. Custom orders and sale items are final sale. Contact us within 30 days to initiate a return.',
    category: 'returns'
  },
  {
    id: '13',
    question: 'How do I return an item?',
    answer: 'To return an item, contact our customer service within 30 days of delivery. We\'ll provide you with a return authorization and shipping label. Returns are processed within 5-7 business days of receiving the item.',
    category: 'returns'
  },
  {
    id: '14',
    question: 'Do you offer exchanges?',
    answer: 'Yes, we offer exchanges for different sizes or colors if the item is in stock. Exchanges are subject to availability. If the item you want is not available, we can process a return and you can place a new order.',
    category: 'returns'
  },
  // Customer Service
  {
    id: '15',
    question: 'How can I contact customer service?',
    answer: 'You can contact us through our contact form, email at info@aamakosarri.com, or phone at +61 2 1234 5678. Our customer service team is available Monday to Friday, 9 AM to 5 PM AEST. We typically respond within 24 hours.',
    category: 'service'
  },
  {
    id: '16',
    question: 'Do you offer gift wrapping?',
    answer: 'Yes, we offer beautiful gift wrapping for an additional $5. Our gift wrapping includes traditional Nepali paper and ribbon. You can also add a personalized gift message. Select gift wrapping during checkout.',
    category: 'service'
  },
  {
    id: '17',
    question: 'Can I cancel or modify my order?',
    answer: 'Orders can be cancelled or modified within 2 hours of placement, provided they haven\'t been processed for shipping. Contact our customer service immediately if you need to make changes. Once shipped, orders cannot be cancelled.',
    category: 'service'
  },
  // About the Brand
  {
    id: '18',
    question: 'What does "आमाको Saaरी" mean?',
    answer: '"आमाको Saaरी" means "Mother\'s Saari" in Nepali. It represents the deep cultural connection and love for traditional Nepali clothing that is often passed down from mothers to daughters, symbolizing heritage and tradition.',
    category: 'brand'
  },
  {
    id: '19',
    question: 'How do you support Nepali artisans?',
    answer: 'We work directly with skilled Nepali artisans, providing fair wages and sustainable working conditions. We help preserve traditional techniques while creating economic opportunities for local families and communities.',
    category: 'brand'
  },
  {
    id: '20',
    question: 'Are your products ethically made?',
    answer: 'Yes, all our products are ethically made. We ensure fair compensation for artisans, safe working conditions, and sustainable practices. We\'re committed to supporting Nepali communities while preserving cultural heritage.',
    category: 'brand'
  }
]

const categories = [
  { id: 'all', name: 'All Questions', icon: HelpCircle },
  { id: 'shopping', name: 'Shopping & Products', icon: ShoppingBag },
  { id: 'shipping', name: 'Shipping & Delivery', icon: Truck },
  { id: 'payment', name: 'Payment & Security', icon: CreditCard },
  { id: 'returns', name: 'Returns & Exchanges', icon: Shield },
  { id: 'service', name: 'Customer Service', icon: Users }
]

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [openItems, setOpenItems] = useState<string[]>([])

  const filteredFAQs = activeCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === activeCategory)

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Frequently Asked <span className="text-yellow-300">Questions</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Find answers to common questions about आमाको Saaरी
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeCategory === category.id
                        ? 'bg-orange-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white/90'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{category.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="backdrop-blur-xl bg-white/70 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/50 transition-all duration-300 rounded-2xl"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  {openItems.includes(faq.id) ? (
                    <ChevronUp className="w-6 h-6 text-orange-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-orange-600 flex-shrink-0" />
                  )}
                </button>
                
                {openItems.includes(faq.id) && (
                  <div className="px-6 pb-4 animate-fade-in-up">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 text-center">
            <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Still Have Questions?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Can't find the answer you're looking for? Our customer service team is here to help!
              </p>
              <a
                href="/contact"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <span>Contact Us</span>
                <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 