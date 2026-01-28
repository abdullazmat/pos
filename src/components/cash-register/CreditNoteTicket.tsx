"use client";

import React from "react";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";

const CREDIT_NOTE_TICKET_COPY = {
  es: {
    title: "Nota de Crédito",
    reasonLabel: "Motivo:",
    amountLabel: "Monto de devolución:",
    notesLabel: "Notas:",
    footer: "Devolución registrada.",
  },
  en: {
    title: "Credit Note",
    reasonLabel: "Reason:",
    amountLabel: "Refund amount:",
    notesLabel: "Notes:",
    footer: "Refund recorded.",
  },
  pt: {
    title: "Nota de Crédito",
    reasonLabel: "Motivo:",
    amountLabel: "Valor da devolução:",
    notesLabel: "Notas:",
    footer: "Devolução registrada.",
  },
};

interface CreditNoteTicketProps {
  amount: number;
  reason: string;
  notes?: string;
  createdAt?: string;
}

const CreditNoteTicket: React.FC<CreditNoteTicketProps> = ({
  amount,
  reason,
  notes,
  createdAt,
}) => {
  const { currentLanguage, t } = useGlobalLanguage();
  const copy =
    CREDIT_NOTE_TICKET_COPY[
      currentLanguage as keyof typeof CREDIT_NOTE_TICKET_COPY
    ] || CREDIT_NOTE_TICKET_COPY.en;
  const locale = t("__locale__", "common") || "es-AR";
  const formattedAmount = new Intl.NumberFormat(String(locale), {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(amount || 0);

  return (
    <div
      id="credit-note-ticket"
      className="w-full max-w-md px-8 py-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
    >
      <div className="mb-6 space-y-1 text-center">
        <h2 className="text-lg font-bold tracking-wide">{copy.title}</h2>
        {createdAt && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {createdAt}
          </p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {copy.footer}
        </p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600 dark:text-slate-400">
            {copy.reasonLabel}
          </span>
          <span className="font-semibold text-right">{reason}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600 dark:text-slate-400">
            {copy.amountLabel}
          </span>
          <span className="font-semibold text-right">{formattedAmount}</span>
        </div>
        {notes && notes.trim().length > 0 && (
          <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
            <p className="mb-1 text-xs tracking-wide uppercase text-slate-500 dark:text-slate-400">
              {copy.notesLabel}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditNoteTicket;
