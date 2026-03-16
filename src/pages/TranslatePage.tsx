// Translate Page — Main user hub: chatbot translation + document status tracking
// White nav bar, tabbed layout with New Translation + My Translations

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../AuthProvider";
import { useTranslation } from "react-i18next";
import { ChatContainer } from "../components/chat";
import { MySubmissions, SupportPanel } from "../components/dashboard";
import { LanguageSwitcher, StripeCheckout, PaymentHistory } from "../components/common";
import { useChatFlow } from "../hooks/useChatFlow";
import type { NavigateToPage } from "../App";

interface TranslatePageProps {
  onNavigate: NavigateToPage;
}

type Tab = "translate" | "submissions" | "payments" | "support";

const TranslatePage: React.FC<TranslatePageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const {
    state,
    startFlow,
    selectLanguage,
    selectDrcTemplate,
    uploadDocument,
    selectAction,
    selectSpeedTier,
    handlePaymentSuccess,
    handlePaymentFailure,
    handlePaymentCancel,
    restart,
    retryUpload,
    goBack,
    resumeDraft,
  } = useChatFlow();

  const [activeTab, setActiveTab] = useState<Tab>("translate");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click/tap
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const toggleDropdown = useCallback(() => setDropdownOpen((v) => !v), []);

  // Start the flow on mount
  useEffect(() => {
    startFlow();
  }, [startFlow]);

  const isProcessing = ["uploading", "processing", "submitting", "payment_processing"].includes(
    state.step
  );

  // Route option selections to the correct handler
  const handleOptionSelect = (value: string) => {
    if (value === "restart") {
      restart();
      return;
    }
    if (value === "__back__") {
      goBack();
      return;
    }
    if (value === "retry_upload") {
      retryUpload();
      return;
    }
    if (value === "dashboard" || value === "my_translations") {
      setActiveTab("submissions");
      return;
    }
    if (value === "__retry_payment__") {
      // Re-show payment step with existing cert doc
      if (state.paymentData) {
        handlePaymentCancel(); // Reset to tier selection, user picks again
      }
      return;
    }
    if (value === "__back_to_tier__") {
      handlePaymentCancel();
      return;
    }
    if (value === "__retry_submit_after_payment__" && state.certDocId && state.selectedTier) {
      // Payment succeeded but submission failed — retry submission only
      handlePaymentSuccess("", undefined);
      return;
    }

    switch (state.step) {
      case "select_language":
        selectLanguage(value);
        break;
      case "select_drc_template":
        selectDrcTemplate(value);
        break;
      case "select_action":
        selectAction(value);
        break;
      case "select_speed_tier":
        selectSpeedTier(value);
        break;
      case "error":
        // Handle retry actions from error state
        if (value === "view_draft") {
          selectAction(value);
        } else if (value === "__retry_submit__" && state.selectedTier) {
          selectSpeedTier(state.selectedTier);
        }
        break;
    }
  };

  const handleSignOut = () => {
    import("../firebase").then(({ auth }) => {
      import("firebase/auth").then(({ signOut }) => {
        signOut(auth);
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* White Navigation Bar — compact on mobile */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo-wide.png"
              alt="Nyota Translation Center"
              className="h-7 sm:h-9 w-auto"
            />
          </button>
          <div className="flex items-center">
            {/* Avatar Dropdown — click-based for mobile */}
            {currentUser && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-60 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{currentUser.email}</p>
                    </div>
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('common.language', 'Language')}</span>
                      <LanguageSwitcher />
                    </div>
                    <button
                      onClick={() => { setDropdownOpen(false); handleSignOut(); }}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 active:bg-red-50 flex items-center gap-2 rounded-b-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {t('dashboard.navigation.signOut', 'Sign Out')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tab Bar — pill segmented control */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveTab("translate")}
              className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "translate"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 active:text-gray-700"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="hidden sm:inline">{t('translate.tabs.newTranslation', 'New Translation')}</span>
                <span className="sm:hidden">{t('translate.tabs.translate', 'Translate')}</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "submissions"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 active:text-gray-700"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">{t('translate.tabs.myTranslations', 'My Translations')}</span>
                <span className="sm:hidden">{t('translate.tabs.history', 'History')}</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "support"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 active:text-gray-700"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {t('translate.tabs.support', 'Support')}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "payments"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 active:text-gray-700"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="hidden sm:inline">{t('translate.tabs.payments', 'Payments')}</span>
                <span className="sm:hidden">💳</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "translate" ? (
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          <ChatContainer
            messages={state.messages}
            onOptionSelect={handleOptionSelect}
            onFileSelect={uploadDocument}
            isProcessing={isProcessing}
            draftPreview={state.draftPreview}
          />
          {/* Stripe Payment Overlay — shown during payment step */}
          {state.step === "payment" && state.paymentData && (
            <div className="px-3 sm:px-4 py-4 border-t border-gray-200 bg-gray-50">
              <StripeCheckout
                certDocId={state.paymentData.certDocId}
                speedTier={state.paymentData.speedTier}
                formType={state.paymentData.formType}
                documentTitle={state.paymentData.documentTitle}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                onCancel={handlePaymentCancel}
              />
            </div>
          )}
        </div>
      ) : activeTab === "submissions" ? (
        <div className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
          <MySubmissions
            onNavigate={(page) => {
              if (page === "translate") {
                setActiveTab("translate");
                restart();
              }
            }}
            onContinueDraft={(bulletinId) => {
              setActiveTab("translate");
              resumeDraft(bulletinId);
            }}
          />
        </div>
      ) : activeTab === "payments" ? (
        <div className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
          <PaymentHistory />
        </div>
      ) : (
        <div className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
          <SupportPanel />
        </div>
      )}
    </div>
  );
};

export default TranslatePage;
