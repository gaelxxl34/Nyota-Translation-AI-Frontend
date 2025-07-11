import React from "react";

/**
 * PrivacyPolicyPage: Displays the privacy policy for Nyota Translation Center.
 */
const PrivacyPolicyPage: React.FC = () => (
  <div className="max-w-2xl mx-auto p-8">
    <div className="flex flex-row items-center gap-4 mb-6">
      <img
        src="/log.PNG"
        alt="Nyota Translation Center Logo"
        className="h-12 w-auto rounded-lg shadow-md"
      />
      <h1 className="text-2xl font-bold text-gray-900 leading-tight">Privacy Policy</h1>
    </div>
    <p className="mb-4">
      At Nyota Translation Center (NTC), your privacy is important to us. This policy explains how we collect, use, and protect your information.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
    <p className="mb-4">
      We collect your email address for authentication and the documents you upload for translation. We do not collect unnecessary personal information.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
    <p className="mb-4">
      Your information is used solely to provide translation services and improve our platform. We do not sell or share your data with third parties.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">3. Data Security</h2>
    <p className="mb-4">
      We use industry-standard security measures, including Firebase Authentication and Firestore, to protect your data. Uploaded documents are processed securely and deleted when no longer needed.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">4. Cookies & Analytics</h2>
    <p className="mb-4">
      NTC may use cookies and analytics tools to understand usage patterns and improve the user experience. No personally identifiable information is tracked for advertising purposes.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h2>
    <p className="mb-4">
      You may request deletion of your account or data at any time by contacting our support team.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to This Policy</h2>
    <p className="mb-4">
      We may update this policy from time to time. Continued use of NTC constitutes acceptance of any changes.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">7. Contact</h2>
    <p>
      For privacy questions or requests, contact <a href="mailto:support@nyotatranslate.com" className="text-primary-600 underline">support@nyotatranslate.com</a>.
    </p>
  </div>
);

export default PrivacyPolicyPage;
