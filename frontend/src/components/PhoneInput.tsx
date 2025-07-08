'use client'

import React, { useState } from 'react';
import { parsePhoneNumberFromString, AsYouType, getCountries, getCountryCallingCode, CountryCode } from 'libphonenumber-js';

// Minimal country list for demo; can be expanded
const countries = [
  { code: 'AU' as CountryCode, name: 'Australia' },
  { code: 'NP' as CountryCode, name: 'Nepal' },
  { code: 'IN' as CountryCode, name: 'India' },
  { code: 'US' as CountryCode, name: 'United States' },
  { code: 'GB' as CountryCode, name: 'United Kingdom' },
  // ...add more as needed
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, label = 'Phone Number', required }) => {
  const [country, setCountry] = useState<CountryCode>('AU');
  const [error, setError] = useState('');

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value as CountryCode);
    // Reset phone number on country change
    onChange('');
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const asYouType = new AsYouType(country);
    const formatted = asYouType.input(input);
    onChange(formatted);
    setError('');
  };

  const validate = () => {
    const phoneNumber = parsePhoneNumberFromString(value, country);
    if (!phoneNumber || !phoneNumber.isValid()) {
      setError('Invalid phone number for selected country');
      return false;
    }
    setError('');
    return true;
  };

  // Show country code
  const countryCode = getCountryCallingCode(country);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center space-x-2">
        <select
          className="rounded-lg border px-2 py-2 bg-white/80 text-black focus:outline-none"
          value={country}
          onChange={handleCountryChange}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} (+{getCountryCallingCode(c.code)})
            </option>
          ))}
        </select>
        <span className="text-gray-700 font-semibold">+{countryCode}</span>
        <input
          type="tel"
          className="flex-1 rounded-lg border px-3 py-2 bg-white/80 text-black focus:outline-none"
          placeholder="e.g. 412 345 678"
          value={value}
          onChange={handleInputChange}
          onBlur={validate}
          required={required}
        />
      </div>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
};

export default PhoneInput; 