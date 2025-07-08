'use client';

import { useState } from 'react';
import { ArrowLeft, Ruler, User, Heart, Zap, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SizeGuidePage() {
  const [selectedCategory, setSelectedCategory] = useState('women');
  const [measurements, setMeasurements] = useState({
    chest: '',
    waist: '',
    hips: '',
    height: '',
    weight: ''
  });
  const [recommendedSize, setRecommendedSize] = useState('');

  const categories = [
    { id: 'women', name: 'Women', icon: User },
    { id: 'men', name: 'Men', icon: User },
    { id: 'kids', name: 'Kids', icon: User }
  ];

  const sizeCharts = {
    women: {
      title: 'Women\'s Size Chart',
      measurements: ['Chest', 'Waist', 'Hips'],
      sizes: [
        { size: 'XS', chest: '32-34', waist: '26-28', hips: '36-38' },
        { size: 'S', chest: '34-36', waist: '28-30', hips: '38-40' },
        { size: 'M', chest: '36-38', waist: '30-32', hips: '40-42' },
        { size: 'L', chest: '38-40', waist: '32-34', hips: '42-44' },
        { size: 'XL', chest: '40-42', waist: '34-36', hips: '44-46' },
        { size: 'XXL', chest: '42-44', waist: '36-38', hips: '46-48' }
      ]
    },
    men: {
      title: 'Men\'s Size Chart',
      measurements: ['Chest', 'Waist', 'Hips'],
      sizes: [
        { size: 'S', chest: '36-38', waist: '30-32', hips: '38-40' },
        { size: 'M', chest: '38-40', waist: '32-34', hips: '40-42' },
        { size: 'L', chest: '40-42', waist: '34-36', hips: '42-44' },
        { size: 'XL', chest: '42-44', waist: '36-38', hips: '44-46' },
        { size: 'XXL', chest: '44-46', waist: '38-40', hips: '46-48' }
      ]
    },
    kids: {
      title: 'Kids Size Chart',
      measurements: ['Age', 'Height', 'Chest'],
      sizes: [
        { size: '2-3Y', age: '2-3 years', height: '32-36', chest: '20-22' },
        { size: '4-5Y', age: '4-5 years', height: '36-40', chest: '22-24' },
        { size: '6-7Y', age: '6-7 years', height: '40-44', chest: '24-26' },
        { size: '8-9Y', age: '8-9 years', height: '44-48', chest: '26-28' },
        { size: '10-11Y', age: '10-11 years', height: '48-52', chest: '28-30' },
        { size: '12-13Y', age: '12-13 years', height: '52-56', chest: '30-32' }
      ]
    }
  };

  const tips = [
    {
      icon: Ruler,
      title: 'How to Measure',
      description: 'Use a flexible measuring tape and measure over your undergarments for the most accurate fit.'
    },
    {
      icon: Heart,
      title: 'Comfort First',
      description: 'Choose the size that feels most comfortable. You can always exchange if needed.'
    },
    {
      icon: Zap,
      title: 'Quick Tips',
      description: 'For tops, measure around the fullest part of your chest. For bottoms, measure around your natural waist.'
    }
  ];

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  const findRecommendedSize = () => {
    if (!measurements.chest || !measurements.waist) return;

    const chest = parseInt(measurements.chest);
    const waist = parseInt(measurements.waist);
    
    const chart = sizeCharts[selectedCategory as keyof typeof sizeCharts];
    let bestSize = '';

    for (const size of chart.sizes) {
      if ('waist' in size) {
        const [minChest, maxChest] = size.chest.split('-').map(Number);
        const [minWaist, maxWaist] = size.waist.split('-').map(Number);
        
        if (chest >= minChest && chest <= maxChest && waist >= minWaist && waist <= maxWaist) {
          bestSize = size.size;
          break;
        }
      }
    }

    setRecommendedSize(bestSize || 'Size not found - please contact us');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Size Guide</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find your perfect fit with our comprehensive size guide and measurement tools.
          </p>
        </div>

        {/* Category Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-2 shadow-lg">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-orange-50'
                }`}
              >
                <category.icon className="w-4 h-4 inline mr-2" />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Size Finder */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Your Size</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chest (inches)
                </label>
                <input
                  type="number"
                  value={measurements.chest}
                  onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., 36"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waist (inches)
                </label>
                <input
                  type="number"
                  value={measurements.waist}
                  onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., 30"
                />
              </div>

              {selectedCategory === 'women' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hips (inches)
                  </label>
                  <input
                    type="number"
                    value={measurements.hips}
                    onChange={(e) => handleMeasurementChange('hips', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., 40"
                  />
                </div>
              )}
            </div>

            <button
              onClick={findRecommendedSize}
              className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Find My Size
            </button>

            {recommendedSize && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-semibold text-green-800">
                    Recommended Size: {recommendedSize}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Size Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {sizeCharts[selectedCategory as keyof typeof sizeCharts].title}
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Size</th>
                    {sizeCharts[selectedCategory as keyof typeof sizeCharts].measurements.map((measurement) => (
                      <th key={measurement} className="text-left py-3 px-4 font-semibold text-gray-900">
                        {measurement}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                                     {sizeCharts[selectedCategory as keyof typeof sizeCharts].sizes.map((size) => (
                     <tr key={size.size} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="py-3 px-4 font-medium text-gray-900">{size.size}</td>
                       <td className="py-3 px-4 text-gray-600">{size.chest}</td>
                       {'waist' in size && <td className="py-3 px-4 text-gray-600">{size.waist}</td>}
                       {selectedCategory === 'women' && 'hips' in size && (
                         <td className="py-3 px-4 text-gray-600">{size.hips}</td>
                       )}
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Size Guide Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tips.map((tip, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <tip.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Measurement Guide */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Measure</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">For Tops & Dresses</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>Chest:</strong> Measure around the fullest part of your chest</li>
                <li>• <strong>Waist:</strong> Measure around your natural waistline</li>
                <li>• <strong>Hips:</strong> Measure around the fullest part of your hips</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">For Bottoms</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>Waist:</strong> Measure around your natural waistline</li>
                <li>• <strong>Hips:</strong> Measure around the fullest part of your hips</li>
                <li>• <strong>Inseam:</strong> Measure from crotch to desired length</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Still unsure about your size?</p>
          <Link 
            href="/contact" 
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Contact Us for Help
          </Link>
        </div>
      </div>
    </div>
  );
} 