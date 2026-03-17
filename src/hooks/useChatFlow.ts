// Chat Flow Hook — State machine for the zero-typing chatbot UX
// Manages conversation steps, messages, and API calls

import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../AuthProvider";
import type {
  ChatState,
  ChatMessage,
  ChatStep,
  DraftPreview,
} from "../types/chat";
import {
  getLanguageOptions,
  getDrcTemplateOptions,
  getActionOptions,
  getSpeedTierOptions,
} from "../types/chat";
import * as chatService from "../services/chatService";

let messageCounter = 0;
const nextId = () => `msg_${++messageCounter}_${Date.now()}`;

const createMessage = (
  type: ChatMessage["type"],
  content: string,
  extra?: Partial<ChatMessage>
): ChatMessage => ({
  id: nextId(),
  type,
  content,
  timestamp: new Date(),
  ...extra,
});

const INITIAL_STATE: ChatState = {
  step: "welcome",
  messages: [],
  sourceLanguage: null,
  selectedFormType: null,
  uploadResult: null,
  draftPreview: null,
  draftPdfUrl: null,
  selectedTier: null,
  certDocId: null,
  paymentData: null,
  error: null,
};

export const useChatFlow = () => {
  const { getFreshToken, logout } = useAuth();
  const { t } = useTranslation();
  const [state, setState] = useState<ChatState>(INITIAL_STATE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BACK_OPTION = { id: "back", label: t("chat.back"), value: "__back__", description: "" };

  const addMessages = useCallback(
    (msgs: ChatMessage[], step?: ChatStep) => {
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, ...msgs],
        ...(step ? { step } : {}),
      }));
    },
    []
  );

  const updateStep = useCallback((step: ChatStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  // ── Step 1: Welcome ──────────────────────────────────────
  const startFlow = useCallback(() => {
    messageCounter = 0;
    setState({
      ...INITIAL_STATE,
      step: "select_language",
      messages: [
        createMessage("bot", t("chat.welcome")),
        createMessage(
          "bot",
          t("chat.selectDocType"),
          { options: getLanguageOptions(t) }
        ),
      ],
    });
  }, [t]);

  // ── Step 2: Select Language / Region ─────────────────────
  const selectLanguage = useCallback(
    (langValue: string) => {
      const selected = getLanguageOptions(t).find((o) => o.value === langValue);
      const label = selected?.label || langValue;

      if (langValue === "drc") {
        setState((prev) => ({
          ...prev,
          sourceLanguage: "fr",
          step: "select_drc_template",
          messages: [
            ...prev.messages,
            createMessage("user", label),
            createMessage(
              "bot",
              t("chat.selectDrcTemplate"),
              { options: [...getDrcTemplateOptions(t), BACK_OPTION] }
            ),
          ],
        }));
      } else {
        // Other languages — go straight to upload with generalDocument
        setState((prev) => ({
          ...prev,
          sourceLanguage: langValue,
          selectedFormType: "generalDocument",
          step: "upload_document",
          messages: [
            ...prev.messages,
            createMessage("user", label),
            createMessage("bot", t("chat.uploadPrompt"), {
              component: "upload",
              options: [BACK_OPTION],
            }),
          ],
        }));
      }
    },
    [t, BACK_OPTION]
  );

  // ── Step 2b: Select DRC Template ─────────────────────────
  const selectDrcTemplate = useCallback(
    (formType: string) => {
      const selected = getDrcTemplateOptions(t).find((o) => o.value === formType);
      const label = selected?.label || formType;

      setState((prev) => ({
        ...prev,
        selectedFormType: formType,
        step: "upload_document",
        messages: [
          ...prev.messages,
          createMessage("user", label),
          createMessage("bot", t("chat.uploadPromptShort"), {
            component: "upload",
            options: [BACK_OPTION],
          }),
        ],
      }));
    },
    [t, BACK_OPTION]
  );

  // ── Step 3: Upload Document ──────────────────────────────
  const uploadDocument = useCallback(
    async (file: File) => {
      // Show uploading state
      setState((prev) => ({
        ...prev,
        step: "uploading",
        messages: [
          ...prev.messages,
          createMessage("user", `📎 ${file.name}`),
          createMessage("system", t("chat.uploading")),
        ],
      }));

      try {
        const freshToken = await getFreshToken();
        const result = await chatService.uploadDocument(
          freshToken,
          file,
          state.sourceLanguage || "auto",
          state.selectedFormType || "generalDocument"
        );

        if (!result.success || !result.data) {
          throw new Error(result.error || "Upload failed");
        }

        const data = result.data as Record<string, unknown>;
        const studentName =
          (data.studentName as string) ||
          (data.student_name as string) ||
          "Student";

        const preview: DraftPreview = {
          certDocId: "",
          firestoreId: result.firestoreId || "",
          formType: result.formType || state.selectedFormType || "generalDocument",
          studentName,
          sourceLanguage: state.sourceLanguage || "auto",
          targetLanguage: "en",
          data,
        };

        setState((prev) => ({
          ...prev,
          step: "preview_draft",
          uploadResult: result,
          draftPreview: preview,
          messages: [
            ...prev.messages.filter((m) => m.type !== "system"),
            createMessage(
              "bot",
              t("chat.documentProcessed", { name: studentName }),
              { component: "preview" }
            ),
          ],
        }));

        // After a brief delay, show action options
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            step: "select_action",
            messages: [
              ...prev.messages,
              createMessage(
                "bot",
                t("chat.selectAction"),
                { options: [...getActionOptions(t), BACK_OPTION] }
              ),
            ],
          }));
        }, 1500);

        // Pre-generate PDF in background so View Draft is instant
        if (result.firestoreId) {
          const bgFirestoreId = result.firestoreId;
          getFreshToken().then((bgToken) =>
            chatService.exportDraftPdf(bgToken, bgFirestoreId, window.location.origin)
              .then((blob) => {
                const url = URL.createObjectURL(blob);
                setState((prev) => ({ ...prev, draftPdfUrl: url }));
              })
              .catch(() => { /* PDF will be generated on-demand if this fails */ })
          ).catch(() => {});
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Something went wrong";
        setState((prev) => ({
          ...prev,
          step: "error",
          error: errorMsg,
          messages: [
            // Remove the "system" spinner message before adding the error
            ...prev.messages.filter((m) => m.type !== "system"),
            createMessage(
              "bot",
              t("chat.errorUpload", { error: errorMsg }),
              {
                options: [
                  { id: "retry_upload", label: t("chat.tryAgain"), value: "retry_upload" },
                  { id: "restart", label: t("chat.startOver"), value: "restart" },
                ],
              }
            ),
          ],
        }));
      }
    },
    [getFreshToken, state.sourceLanguage, state.selectedFormType, addMessages, updateStep]
  );

  // ── Step 4: Select Action ────────────────────────────────
  const selectAction = useCallback(
    async (actionValue: string) => {
      const selected = getActionOptions(t).find((o) => o.value === actionValue);
      addMessages([createMessage("user", selected?.label || actionValue)]);

      if (actionValue === "view_draft") {
        if (!state.draftPreview?.firestoreId) {
          addMessages([createMessage("bot", t("chat.errorMissingData"), {
            options: [{ id: "restart", label: t("chat.startOver"), value: "restart" }],
          })], "error");
          return;
        }

        // If PDF was pre-generated, open it instantly
        if (state.draftPdfUrl) {
          window.open(state.draftPdfUrl, "_blank");
          setState((prev) => ({
            ...prev,
            step: "select_action" as ChatStep,
            messages: [
              ...prev.messages,
              createMessage(
                "bot",
                t("chat.pdfOpened"),
                { options: [...getActionOptions(t), BACK_OPTION] }
              ),
            ],
          }));
          return;
        }

        // Open tab synchronously (within user gesture) to avoid popup blocker
        const newTab = window.open("about:blank", "_blank");
        if (newTab) {
          newTab.document.write(`<html><head><title>${t("chat.pdfGenerating")}</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;color:#334155}div{text-align:center}.spinner{width:48px;height:48px;border:4px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 24px}@keyframes spin{to{transform:rotate(360deg)}}h2{font-size:1.25rem;font-weight:600;margin:0 0 8px}p{font-size:.875rem;color:#64748b;margin:0}</style></head><body><div><div class="spinner"></div><h2>${t("chat.pdfGenerating")}</h2><p>${t("chat.pdfGeneratingDesc")}</p></div></body></html>`);
          newTab.document.close();
        }

        try {
          const freshToken = await getFreshToken();
          const blob = await chatService.exportDraftPdf(
            freshToken,
            state.draftPreview.firestoreId,
            window.location.origin
          );

          const url = URL.createObjectURL(blob);
          if (newTab && !newTab.closed) {
            newTab.location.href = url;
          } else {
            window.open(url, "_blank");
          }

          setState((prev) => ({
            ...prev,
            step: "select_action" as ChatStep,
            draftPdfUrl: url,
            messages: [
              ...prev.messages,
              createMessage(
                "bot",
                t("chat.pdfOpened"),
                { options: [...getActionOptions(t), BACK_OPTION] }
              ),
            ],
          }));
        } catch (err) {
          if (newTab && !newTab.closed) newTab.close();
          const errorMsg =
            err instanceof Error ? err.message : "PDF generation failed";
          setState((prev) => ({
            ...prev,
            step: "error" as ChatStep,
            error: errorMsg,
            messages: [
              ...prev.messages,
              createMessage(
                "bot",
                t("chat.errorPdfFailed", { error: errorMsg }),
                {
                  options: [
                    { id: "retry_view", label: t("chat.tryAgain"), value: "view_draft" },
                    { id: "restart", label: t("chat.startOver"), value: "restart" },
                  ],
                }
              ),
            ],
          }));
        }
      } else if (actionValue === "certify") {
        // Show speed tier selection
        addMessages(
          [
            createMessage(
              "bot",
              t("chat.selectSpeed"),
              { options: [...getSpeedTierOptions(t), BACK_OPTION] }
            ),
          ],
          "select_speed_tier"
        );
      }
    },
    [getFreshToken, state.draftPreview, state.draftPdfUrl, addMessages]
  );

  // ── Step 5: Select Speed Tier → Create Cert Doc → Show Payment ────
  const selectSpeedTier = useCallback(
    async (tierValue: string) => {
      const selected = getSpeedTierOptions(t).find((o) => o.value === tierValue);
      addMessages([createMessage("user", selected?.label || tierValue)]);

      setState((prev) => ({
        ...prev,
        selectedTier: tierValue,
        step: "submitting" as ChatStep,
        messages: [
          ...prev.messages.slice(0, -1),
          prev.messages[prev.messages.length - 1],
          createMessage("system", t("chat.preparingOrder")),
        ],
      }));

      try {
        if (!state.draftPreview) {
          throw new Error("Missing document data");
        }

        const freshToken = await getFreshToken();
        // Create certified document entry (draft status)
        const createResult = await chatService.createCertifiedSubmission(
          freshToken,
          {
            firestoreId: state.draftPreview.firestoreId,
            formType: state.draftPreview.formType,
            sourceLanguage: state.draftPreview.sourceLanguage,
            originalData: state.draftPreview.data,
            storageUrl: state.uploadResult?.storageUrl as string,
            storagePath: state.uploadResult?.storagePath as string,
            fileName: state.uploadResult?.fileName as string || state.uploadResult?.data?.fileName as string,
            fileSize: state.uploadResult?.fileSize as number || state.uploadResult?.data?.fileSize as number,
          }
        );

        if (!createResult.success || !createResult.certDocId) {
          throw new Error(createResult.error || "Failed to create submission");
        }

        // Transition to payment step — StripeCheckout will render in TranslatePage
        const studentName = state.draftPreview.studentName || state.draftPreview.data?.studentName as string || undefined;

        setState((prev) => ({
          ...prev,
          certDocId: createResult.certDocId!,
          paymentData: {
            certDocId: createResult.certDocId!,
            speedTier: tierValue,
            formType: state.draftPreview?.formType,
            documentTitle: studentName,
          },
          step: "payment" as ChatStep,
          messages: [
            ...prev.messages.filter((m) => m.type !== "system"),
            createMessage(
              "bot",
              t("chat.paymentPrompt", { tier: selected?.label || tierValue })
            ),
          ],
        }));
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to prepare submission";
        setState((prev) => ({
          ...prev,
          step: "error" as ChatStep,
          error: errorMsg,
          messages: [
            ...prev.messages.filter((m) => m.type !== "system"),
            createMessage(
              "bot",
              `❌ ${errorMsg}.`,
              {
                options: [
                  { id: "retry_tier", label: t("chat.tryAgain"), value: "__retry_submit__" },
                  { id: "restart", label: t("chat.startOver"), value: "restart" },
                ],
              }
            ),
          ],
        }));
      }
    },
    [getFreshToken, state.draftPreview, state.uploadResult, addMessages]
  );

  // ── Step 6: Payment Success → Submit for Review ─────────
  const handlePaymentSuccess = useCallback(
    async (_paymentIntentId: string, _invoiceId?: string) => {
      setState((prev) => ({
        ...prev,
        step: "submitting" as ChatStep,
        messages: [
          ...prev.messages,
          createMessage("system", t("chat.processingSubmission")),
        ],
      }));

      try {
        const freshToken = await getFreshToken();
        const certDocId = state.certDocId;
        const tierValue = state.selectedTier;

        if (!certDocId || !tierValue) {
          throw new Error("Missing submission data");
        }

        // Submit for review with speed tier
        const submitResult = await chatService.submitForReview(
          freshToken,
          certDocId,
          tierValue
        );

        if (!submitResult.success) {
          throw new Error(submitResult.error || "Submission failed");
        }

        const selected = getSpeedTierOptions(t).find((o) => o.value === tierValue);

        setState((prev) => ({
          ...prev,
          step: "submitted" as ChatStep,
          paymentData: null,
          messages: [
            ...prev.messages.filter((m) => m.type !== "system"),
            createMessage(
              "bot",
              t("chat.paymentSuccess", { tier: selected?.label || tierValue })
            ),
            createMessage(
              "bot",
              t("chat.paymentSuccessNext"),
              {
                options: [
                  {
                    id: "new",
                    label: t("chat.translateAnother"),
                    value: "restart",
                  },
                  {
                    id: "dashboard",
                    label: t("chat.goToDashboard"),
                    value: "dashboard",
                  },
                ],
              }
            ),
          ],
        }));
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Submission failed after payment";
        setState((prev) => ({
          ...prev,
          step: "error" as ChatStep,
          error: errorMsg,
          messages: [
            ...prev.messages.filter((m) => m.type !== "system"),
            createMessage(
              "bot",
              t("chat.paymentFailedSubmit", { error: errorMsg }),
              {
                options: [
                  { id: "retry_submit", label: t("chat.retrySubmission"), value: "__retry_submit_after_payment__" },
                  { id: "restart", label: t("chat.startOver"), value: "restart" },
                ],
              }
            ),
          ],
        }));
      }
    },
    [getFreshToken, state.certDocId, state.selectedTier, t]
  );

  // ── Step 6b: Payment Failure → Show error & allow retry ──
  const handlePaymentFailure = useCallback(
    (error: string) => {
      setState((prev) => ({
        ...prev,
        step: "error" as ChatStep,
        error,
        messages: [
          ...prev.messages,
          createMessage(
            "bot",
            t("chat.paymentFailed", { error }),
            {
              options: [
                { id: "retry_payment", label: t("chat.retryPayment"), value: "__retry_payment__" },
                { id: "back_tier", label: t("chat.changePlan"), value: "__back_to_tier__" },
                { id: "restart", label: t("chat.startOver"), value: "restart" },
              ],
            }
          ),
        ],
      }));
    },
    [t]
  );

  // ── Payment Cancel → Back to speed tier selection ────────
  const handlePaymentCancel = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: "select_speed_tier" as ChatStep,
      paymentData: null,
      messages: [
        ...prev.messages,
        createMessage(
          "bot",
          t("chat.paymentCancel"),
          { options: [...getSpeedTierOptions(t), BACK_OPTION] }
        ),
      ],
    }));
  }, [t, BACK_OPTION]);

  // ── Go Back — reverse to the previous step ──────────────
  const goBack = useCallback(() => {
    setState((prev) => {
      // Determine where to go back based on current step
      switch (prev.step) {
        case "select_drc_template":
          // Back to language selection
          return {
            ...prev,
            sourceLanguage: null,
            step: "select_language" as ChatStep,
            messages: [
              ...prev.messages,
              createMessage("bot", t("chat.goBackPrompt"), {
                options: getLanguageOptions(t),
              }),
            ],
          };
        case "upload_document":
          // Back to language or DRC template selection
          if (prev.sourceLanguage === "fr" && prev.selectedFormType && prev.selectedFormType !== "generalDocument") {
            return {
              ...prev,
              selectedFormType: null,
              step: "select_drc_template" as ChatStep,
              messages: [
                ...prev.messages,
                createMessage("bot", t("chat.selectDrcTemplate"), {
                  options: [...getDrcTemplateOptions(t), BACK_OPTION],
                }),
              ],
            };
          }
          // Back to language selection
          return {
            ...prev,
            sourceLanguage: null,
            selectedFormType: null,
            step: "select_language" as ChatStep,
            messages: [
              ...prev.messages,
              createMessage("bot", t("chat.selectDocType"), {
                options: getLanguageOptions(t),
              }),
            ],
          };
        case "select_action":
          // Back from action goes to restart since re-upload isn't practical
          return {
            ...INITIAL_STATE,
            step: "select_language",
            messages: [
              ...prev.messages,
              createMessage("bot", t("chat.goBackFresh"), {
                options: getLanguageOptions(t),
              }),
            ],
          };
        case "select_speed_tier":
          // Back to action selection
          return {
            ...prev,
            step: "select_action" as ChatStep,
            messages: [
              ...prev.messages,
              createMessage("bot", t("chat.selectAction"), {
                options: [...getActionOptions(t), BACK_OPTION],
              }),
            ],
          };
        case "payment":
          // Back from payment to speed tier selection
          return {
            ...prev,
            step: "select_speed_tier" as ChatStep,
            paymentData: null,
            messages: [
              ...prev.messages,
              createMessage("bot", t("chat.selectSpeed"), {
                options: [...getSpeedTierOptions(t), BACK_OPTION],
              }),
            ],
          };
        default:
          // For error state or unknown steps, go back to upload
          if (prev.step === "error") {
            return {
              ...prev,
              step: "upload_document" as ChatStep,
              error: null,
              messages: [
                ...prev.messages,
                createMessage("bot", t("chat.uploadRetry"), {
                  component: "upload",
                  options: [BACK_OPTION],
                }),
              ],
            };
          }
          return prev;
      }
    });
  }, [t, BACK_OPTION]);

  // ── Navigation / Reset ───────────────────────────────────
  const restart = useCallback(() => {
    startFlow();
  }, [startFlow]);

  const retryUpload = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: "upload_document",
      error: null,
      messages: [
        ...prev.messages,
        createMessage("bot", t("chat.uploadRetry"), {
          component: "upload",
        }),
      ],
    }));
  }, [t]);

  // ── Resume Draft — load an existing bulletin from Firestore ──
  const resumeDraft = useCallback(
    async (bulletinId: string) => {
      messageCounter = 0;
      setState({
        ...INITIAL_STATE,
        step: "processing" as ChatStep,
        messages: [
          createMessage("bot", t("chat.welcomeBack")),
          createMessage("system", t("chat.loadingDocument")),
        ],
      });

      try {
        // Always get a fresh token to avoid expired token errors
        const freshToken = await getFreshToken();
        const [bulletinResult, submissionResult] = await Promise.all([
          chatService.getBulletin(freshToken, bulletinId),
          chatService.checkBulletinSubmission(freshToken, bulletinId),
        ]);

        if (!bulletinResult.success || !bulletinResult.bulletin) {
          throw new Error(bulletinResult.error || "Could not load document");
        }

        const { bulletin } = bulletinResult;
        const data = bulletin.data;
        const studentName =
          (data.academicInfo as Record<string, unknown>)?.studentName as string ||
          (data.studentName as string) ||
          "Student";

        const preview: DraftPreview = {
          certDocId: "",
          firestoreId: bulletinId,
          formType: bulletin.formType,
          studentName,
          sourceLanguage: bulletin.sourceLanguage,
          targetLanguage: "en",
          data,
        };

        // Check if this bulletin already has a certification submission
        const hasSubmission = submissionResult.success && submissionResult.hasSubmission;
        const submission = submissionResult.submission;

        let actionMessage: string;
        let actionOptions: ReturnType<typeof getActionOptions>;

        if (hasSubmission && submission) {
          const statusLabels: Record<string, string> = {
            pending_review: t("chat.statusPending"),
            in_review: t("chat.statusInReview"),
            certified: t("chat.statusCertified"),
            rejected: t("chat.statusRejected"),
          };
          const statusLabel = statusLabels[submission.status] || submission.status;

          if (submission.status === "certified") {
            actionMessage = t("chat.resumeCertified", { name: studentName, certId: submission.certificationId || "" });
            actionOptions = [getActionOptions(t)[0]]; // Only "View Free Draft"
          } else if (submission.status === "rejected") {
            const reason = submission.rejectionReason ? t("chat.rejectionReason", { reason: submission.rejectionReason }) : "";
            actionMessage = t("chat.resumeRejected", { name: studentName, reason });
            actionOptions = [getActionOptions(t)[0]]; // Only "View Free Draft"
          } else {
            // pending_review or in_review
            actionMessage = t("chat.resumeInProgress", { name: studentName, status: statusLabel });
            actionOptions = [getActionOptions(t)[0]]; // Only "View Free Draft"
          }
        } else {
          actionMessage = t("chat.selectAction");
          actionOptions = [...getActionOptions(t)]; // Both options: View Draft + Get Certified
        }

        setState({
          ...INITIAL_STATE,
          step: "select_action" as ChatStep,
          sourceLanguage: bulletin.sourceLanguage,
          selectedFormType: bulletin.formType,
          uploadResult: {
            success: true,
            firestoreId: bulletinId,
            data,
            storageUrl: bulletin.storageUrl,
            storagePath: bulletin.storagePath,
            fileName: bulletin.fileName,
            fileSize: bulletin.fileSize,
          },
          draftPreview: preview,
          messages: [
            createMessage("bot", t("chat.welcomeBack")),
            createMessage(
              "bot",
              t("chat.resumeDocument", { name: studentName }),
              { component: "preview" }
            ),
            createMessage(
              "bot",
              actionMessage,
              { options: [...actionOptions, BACK_OPTION] }
            ),
          ],
        });

        // Pre-generate PDF in background so View Draft is instant
        getFreshToken().then((bgToken) =>
          chatService.exportDraftPdf(bgToken, bulletinId, window.location.origin)
            .then((blob) => {
              const url = URL.createObjectURL(blob);
              setState((prev) => ({ ...prev, draftPdfUrl: url }));
            })
            .catch(() => {})
        ).catch(() => {});
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load document";
        // If token refresh itself failed, the user's session is truly expired — log them out
        if (errorMsg === "Not authenticated") {
          await logout();
          return;
        }
        setState({
          ...INITIAL_STATE,
          step: "error" as ChatStep,
          error: errorMsg,
          messages: [
            createMessage("bot", t("chat.welcomeBack")),
            createMessage(
              "bot",
              t("chat.errorLoadDoc", { error: errorMsg }),
              {
                options: [
                  { id: "restart", label: t("chat.startOver"), value: "restart" },
                ],
              }
            ),
          ],
        });
      }
    },
    [getFreshToken, logout, t, BACK_OPTION]
  );

  return {
    state,
    fileInputRef,
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
  };
};
