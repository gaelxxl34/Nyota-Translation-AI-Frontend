import React from "react";

/**
 * TermsAndConditionsPage: Displays the terms and conditions for Nyota Translation Center.
 */
const TermsAndConditionsPage: React.FC = () => (
  <div className="max-w-2xl mx-auto p-8">
    <div className="flex flex-row items-center gap-3 mb-6">
      <img
        src="/icon.png"
        alt="Nyota Translation Center Logo"
        className="w-8 h-8 rounded-lg object-cover"
      />
      <h1 className="text-2xl font-bold text-gray-900 leading-tight">Terms and Conditions</h1>
    </div>
    <p className="mb-4">
      Welcome to the Nyota Translation Center (NTC). By accessing or using our services, you agree to be bound by these terms and conditions. Please read them carefully.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">1. Use of Service</h2>
    <p className="mb-4">
      NTC provides translation services for educational documents. You agree to use the service for lawful purposes only. You are responsible for the content you upload and must have the right to use and share any documents submitted for translation.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">2. Accuracy of Translations</h2>
    <p className="mb-4">
      While we strive for high-quality translations, NTC does not guarantee the accuracy, completeness, or suitability of any translated content. Users should review all translations before relying on them for official or critical purposes.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">3. User Conduct</h2>
    <p className="mb-4">
      You agree not to misuse the service, upload harmful or illegal content, or attempt to disrupt the platform. Violations may result in suspension or termination of your account.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">4. Data & Privacy</h2>
    <p className="mb-4">
      Your data is handled according to our <a href="#" className="text-primary-600 underline" onClick={e => { e.preventDefault(); window.location.hash = '#/privacy'; }}>Privacy Policy</a>. We take reasonable measures to protect your information.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">5. Changes to Terms</h2>
    <p className="mb-4">
      We reserve the right to update these terms at any time. Continued use of the app constitutes acceptance of any changes. Please review this page periodically.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">6. Contact</h2>
    <p>
      For questions about these terms, please contact our support team at <a href="mailto:support@nyotatranslate.com" className="text-primary-600 underline">support@nyotatranslate.com</a>.
    </p>
  </div>
);

export default TermsAndConditionsPage;
