// Register Page Component for NTC
// Coming Soon page with contact information for account creation requests

import React from 'react';
import SEOHead from './SEOHead';
import AuthNavigation from './AuthNavigation';
import type { NavigateToPage } from '../App';

interface RegisterPageProps {
  onNavigate: NavigateToPage;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <SEOHead 
        title="Registration Coming Soon - Nyota Translation Center | Contact IUEA"
        description="Account registration coming soon! Contact IUEA ICT Department to get early access to Nyota Translation Center's AI-powered academic document translation services."
        keywords="registration, coming soon, IUEA ICT Department, contact, early access, academic translation, account creation"
        url="https://nyotatranslate.com/register"
      />
      
      {/* Navigation Header */}
      <AuthNavigation onNavigate={onNavigate} />
      
      {/* Main Content */}
      <div className="flex flex-col justify-center py-8 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          {/* Coming Soon Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
              Registration Coming Soon!
            </h2>
            <p className="text-lg text-gray-600">
              We're preparing something amazing for you
            </p>
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="bg-white py-8 px-6 shadow-2xl rounded-xl border border-gray-100 sm:px-10">
            
            {/* Coming Soon Message */}
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  🚀 Account Registration Coming Soon
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We're working hard to bring you the best academic document translation experience. 
                  In the meantime, our team is ready to help you get started!
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Get in Touch with Our Team
                </h4>

                {/* Phone Contact */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-medium text-gray-900">Call Us</span>
                  </div>
                  <a href="tel:+256749117690" className="text-lg font-mono text-blue-600 hover:text-blue-800 transition-colors">
                    +256 749 117 690
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    Our agent will get in touch with you within 24 hours
                  </p>
                </div>

                {/* Physical Address */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-gray-900">Visit Us</span>
                  </div>
                  <div className="text-gray-700">
                    <p className="font-medium">ICT Department</p>
                    <p>International University of East Africa (IUEA)</p>
                    <p>Kansanga Campus</p>
                    <p>Kampala, Uganda</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Walk-ins welcome during business hours
                  </p>
                </div>

                {/* Email Contact */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span className="font-medium text-gray-900">Email Us</span>
                  </div>
                  <a href="mailto:contact@nyotainnovation.com" className="text-blue-600 hover:text-blue-800 transition-colors">
                    contact@nyotainnovation.com
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    Send us your details for priority access
                  </p>
                </div>
              </div>

              {/* IUEA Branding */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-center space-x-3">
                  <img
                    src="/iuea-Logo.png"
                    alt="IUEA Logo"
                    className="h-8 w-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">Powered by IUEA Innovations</p>
                    <p className="text-xs text-gray-600">International University of East Africa</p>
                  </div>
                </div>
              </div>

              {/* Already Have Account */}
              <div className="border-t border-gray-200 pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Already have an account from our team?
                  </p>
                  <button
                    onClick={() => onNavigate('login')}
                    className="w-full btn-secondary text-center justify-center"
                  >
                    Sign In Here
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
