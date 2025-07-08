'use client';

import { useState } from 'react';
import { ArrowLeft, Package, Clock, RefreshCw, Shield, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReturnsPage() {
  const [activeTab, setActiveTab] = useState('policy');

  const returnReasons = [
    'Wrong size received',
    'Product doesn\'t match description',
    'Defective or damaged item',
    'Changed my mind',
    'Better alternative found',
    'Gift recipient doesn\'t like it'
  ];

  const returnSteps = [
    {
      step: 1,
      title: 'Initiate Return',
      description: 'Log into your account and go to your orders to start a return',
      icon: Package
    },
    {
      step: 2,
      title: 'Print Label',
      description: 'Download and print the return shipping label',
      icon: RefreshCw
    },
    {
      step: 3,
      title: 'Ship Back',
      description: 'Package the item securely and drop it off at any post office',
      icon: Shield
    },
    {
      step: 4,
      title: 'Get Refund',
      description: 'Receive your refund within 5-7 business days',
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Refunds</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We want you to be completely satisfied with your purchase. If you're not happy, we're here to help.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8">
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'policy'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-orange-50'
            }`}
          >
            Return Policy
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'process'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-orange-50'
            }`}
          >
            Return Process
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'faq'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-orange-50'
            }`}
          >
            FAQ
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {activeTab === 'policy' && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Return Policy</h2>
                <p className="text-gray-600">30-day hassle-free returns on all items</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-800">What You Can Return</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li>• Items in original condition</li>
                    <li>• Unworn clothing with tags</li>
                    <li>• Unused accessories</li>
                    <li>• Defective items</li>
                    <li>• Wrong size or color</li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    <h3 className="font-semibold text-red-800">What You Cannot Return</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li>• Worn or damaged items</li>
                    <li>• Items without original tags</li>
                    <li>• Personal hygiene items</li>
                    <li>• Sale items (final sale)</li>
                    <li>• Custom made items</li>
                  </ul>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-6">
                <h3 className="font-semibold text-orange-800 mb-3">Return Timeframe</h3>
                <div className="flex items-center text-orange-700">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>30 days from delivery date</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'process' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">How to Return</h2>
                <p className="text-gray-600">Follow these simple steps to return your item</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {returnSteps.map((step) => (
                  <div key={step.step} className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                      {step.step}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-blue-800 mb-3">Important Notes</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• Return shipping is free for defective items</li>
                  <li>• Standard returns: $5.99 shipping fee</li>
                  <li>• Refunds processed within 5-7 business days</li>
                  <li>• Original payment method will be credited</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">How long does it take to get my refund?</h3>
                  <p className="text-gray-600">Refunds are typically processed within 5-7 business days after we receive your return.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Can I return a gift?</h3>
                  <p className="text-gray-600">Yes, you can return gifts within 30 days. You'll receive store credit for the purchase amount.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">What if my item arrives damaged?</h3>
                  <p className="text-gray-600">Contact us immediately with photos. We'll provide a free return label and expedited replacement.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Can I exchange for a different size?</h3>
                  <p className="text-gray-600">Yes, you can exchange for a different size. Just note it in your return reason.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Do I need the original packaging?</h3>
                  <p className="text-gray-600">No, but please ensure the item is properly packaged to prevent damage during return shipping.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Need help with your return?</p>
          <Link 
            href="/contact" 
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
} 