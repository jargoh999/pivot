'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
        
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: November 9, 2024</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Account information (name, email, date of birth, gender, etc.)</li>
              <li>Profile information (photos, bio, interests, etc.)</li>
              <li>Messages and other communications</li>
              <li>Payment information (processed securely by our payment processors)</li>
            </ul>
            <p>
              We also automatically collect certain information about your device and usage of our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Provide, maintain, and improve our Service</li>
              <li>Personalize your experience</li>
              <li>Communicate with you about the Service</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Sharing of Information</h2>
            <p className="mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Other users (as part of the Service's functionality)</li>
              <li>Service providers who perform services on our behalf</li>
              <li>Law enforcement or other third parties when required by law</li>
              <li>Business transfers (in case of merger, acquisition, or sale of assets)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
            <p className="mb-4">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Your Choices</h2>
            <p className="mb-2">You can:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Update or delete your account information</li>
              <li>Opt-out of marketing communications</li>
              <li>Disable cookies in your browser settings</li>
              <li>Request access to or deletion of your personal data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Children's Privacy</h2>
            <p className="mb-4">
              Our Service is not intended for users under 18 years of age. We do not knowingly collect personal information from children under 18.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Changes to This Policy</h2>
            <p className="mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@vibechat.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
