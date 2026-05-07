'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white p-6 text-gray-800">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Back
        </button>
        
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: November 9, 2024</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using Vibe Chat (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
            <p className="mb-4">
              You must be at least 18 years old to use this Service. By using the Service, you represent and warrant that you have the right, authority, and capacity to enter into these Terms and to abide by all of the terms and conditions set forth herein.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <p className="mb-2">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. User Conduct</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Use the Service for any illegal purpose or in violation of any local, state, national, or international law</li>
              <li>Harass, abuse, or harm another person</li>
              <li>Post or share inappropriate, offensive, or explicit content</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in any form of solicitation or advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall Vibe Chat, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@vibechat.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
