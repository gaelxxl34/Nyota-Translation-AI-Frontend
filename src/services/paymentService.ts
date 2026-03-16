// Payment Service — API layer for Stripe payment processing
// Handles payment intents, confirmation, history, and invoices

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

/**
 * Create a Stripe Payment Intent for a document submission
 */
export const createPaymentIntent = async (
  idToken: string,
  params: {
    certDocId: string;
    speedTier: string;
    formType?: string;
    documentTitle?: string;
  }
): Promise<{
  success: boolean;
  stripePaymentIntentId?: string;
  clientSecret?: string;
  amount?: number;
  currency?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE}/api/payments/create-intent`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to create payment" };
    }

    return {
      success: true,
      stripePaymentIntentId: result.stripePaymentIntentId,
      clientSecret: result.clientSecret,
      amount: result.amount,
      currency: result.currency,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error — please check your connection",
    };
  }
};

/**
 * Confirm payment after Stripe confirms on the frontend
 * Backup to webhook — ensures we capture payment even if webhook is delayed
 */
export const confirmPayment = async (
  idToken: string,
  paymentIntentId: string
): Promise<{
  success: boolean;
  status?: string;
  invoiceId?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE}/api/payments/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentIntentId }),
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to confirm payment" };
    }

    return {
      success: true,
      status: result.status,
      invoiceId: result.invoiceId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error — please check your connection",
    };
  }
};

/**
 * Cancel a pending payment intent — cleans up Stripe intent and removes Firestore record
 */
export const cancelPayment = async (
  idToken: string,
  paymentIntentId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/api/payments/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentIntentId }),
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to cancel payment" };
    }
    return { success: true };
  } catch {
    // Cancellation is best-effort — don't block user flow
    return { success: false, error: "Network error during cancellation" };
  }
};

/**
 * Check payment intent status directly via Stripe (for polling during checkout)
 */
export const checkIntentStatus = async (
  idToken: string,
  intentId: string
): Promise<{
  success: boolean;
  status?: string;
  invoiceId?: string;
  failureReason?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(
      `${API_BASE}/api/payments/intent-status/${encodeURIComponent(intentId)}`,
      {
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to check status" };
    }

    return {
      success: true,
      status: result.status,
      invoiceId: result.invoiceId,
      failureReason: result.failureReason,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
};

/**
 * Check payment status by record ID (for existing records)
 */
export const checkPaymentStatus = async (
  idToken: string,
  paymentId: string
): Promise<{
  success: boolean;
  status?: string;
  payment?: PaymentRecord;
  invoiceId?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(
      `${API_BASE}/api/payments/status/${encodeURIComponent(paymentId)}`,
      {
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to check status" };
    }

    return {
      success: true,
      status: result.status,
      payment: result.payment,
      invoiceId: result.invoiceId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
};

/**
 * Get user's payment history
 */
export const getPaymentHistory = async (
  idToken: string,
  limit?: number
): Promise<{
  success: boolean;
  payments?: PaymentRecord[];
  error?: string;
}> => {
  try {
    const url = limit
      ? `${API_BASE}/api/payments/history?limit=${limit}`
      : `${API_BASE}/api/payments/history`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to fetch history" };
    }

    return { success: true, payments: result.payments };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
};

/**
 * Get user's invoices
 */
export const getInvoices = async (
  idToken: string,
  limit?: number
): Promise<{
  success: boolean;
  invoices?: InvoiceRecord[];
  error?: string;
}> => {
  try {
    const url = limit
      ? `${API_BASE}/api/payments/invoices?limit=${limit}`
      : `${API_BASE}/api/payments/invoices`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to fetch invoices" };
    }

    return { success: true, invoices: result.invoices };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
};

/**
 * Get a single invoice by ID
 */
export const getInvoice = async (
  idToken: string,
  invoiceId: string
): Promise<{
  success: boolean;
  invoice?: InvoiceRecord;
  error?: string;
}> => {
  try {
    const response = await fetch(
      `${API_BASE}/api/payments/invoice/${encodeURIComponent(invoiceId)}`,
      {
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to fetch invoice" };
    }

    return { success: true, invoice: result.invoice };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
};

// ============================================
// Types
// ============================================

export interface PaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  certDocId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  speedTier: string;
  formType: string;
  documentTitle: string | null;
  status: "succeeded" | "failed" | "expired";
  stripeStatus: string;
  failureReason: string | null;
  invoiceId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  completedAt: string | null;
}

export interface InvoiceRecord {
  id: string;
  paymentId: string;
  userId: string;
  userEmail: string;
  certDocId: string;
  amount: number;
  currency: string;
  speedTier: string;
  formType: string;
  documentTitle: string | null;
  status: string;
  invoiceNumber: string;
  issuedAt: string | null;
  paidAt: string | null;
  items: { description: string; amount: number; quantity: number }[];
}

// Default pricing (fallback if config endpoint unavailable)
export const PRICING: Record<string, { amount: number; currency: string; label: string }> = {
  standard: { amount: 3000, currency: "usd", label: "Standard (Up to 24 hrs)" },
  rush: { amount: 3500, currency: "usd", label: "Rush (Up to 12 hrs)" },
  express: { amount: 4500, currency: "usd", label: "Express (1–5 hrs)" },
};

/**
 * Fetch live pricing and config from backend (reads from Firestore admin settings)
 */
export const getPaymentConfig = async (): Promise<{
  publishableKey: string;
  pricing: Record<string, { amount: number; currency: string; label: string }>;
  paymentsEnabled: boolean;
}> => {
  try {
    const response = await fetch(`${API_BASE}/api/payments/config`);
    const data = await response.json();
    if (data.success) {
      return {
        publishableKey: data.publishableKey || "",
        pricing: data.pricing || PRICING,
        paymentsEnabled: data.paymentsEnabled ?? true,
      };
    }
  } catch {
    // Fallback to defaults
  }
  return { publishableKey: "", pricing: PRICING, paymentsEnabled: true };
};

export const formatAmount = (amount: number, currency: string = "usd"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};
