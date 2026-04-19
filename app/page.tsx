'use client';

import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('');
  const [leadsCount, setLeadsCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('Generating leads... Please wait');

    const formData = new FormData(e.currentTarget);

    const res = await fetch('/api/generate-leads', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      setLeadsCount(data.count);
      setStatus(`✅ Success! ${data.count} verified leads added to Google Sheets.`);
    } else {
      setStatus('❌ Error: ' + (data.error || 'Something went wrong'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Lead Generation CRM</h1>
        <p className="text-center text-gray-600 mb-10">Professional leads for Upwork & Fiverr clients</p>

        <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-3xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Lead Niche & Location</label>
            <input name="niche" required className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-black" placeholder="real estate agencies in Port Harcourt" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Contact Roles</label>
            <input name="roles" required className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-black" placeholder="Owner, CEO, Manager" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Conversion Goal</label>
            <textarea name="goal" required rows={3} className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-black" placeholder="Sell marketing services" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Number of Leads Needed</label>
            <input name="numLeads" type="number" min="100" max="500" defaultValue="100" className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-black" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Extra Instructions</label>
            <textarea name="extra" rows={3} className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-black" placeholder="active on Instagram, high rating" />
          </div>

          <button 
            type="submit" 
            className="w-full bg-black text-white py-5 rounded-3xl font-semibold text-lg hover:bg-gray-800 transition-all"
          >
            Generate Leads Now
          </button>
        </form>

        {status && (
          <div className="mt-8 p-6 bg-gray-100 rounded-3xl text-center">
            <p className="text-lg font-medium">{status}</p>
            {leadsCount > 0 && <p className="text-green-600 mt-3">Leads are now in your Google Sheet</p>}
          </div>
        )}
      </div>
    </div>
  );
}
