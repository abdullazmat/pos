"use client";

import React from "react";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";

const WITHDRAWAL_TICKET_COPY = {
  es: {
    title: "Retiro de Fondos",
    reasonLabel: "Motivo:",
    amountLabel: "Monto Retirado:",
    cashierLabel: "Cajero:",
    supervisorLabel: "Supervisor:",
    summary: "Retiro de fondos",
    footer: "Dinero retirado.",
  },
  en: {
    title: "Funds Withdrawal",
    reasonLabel: "Reason:",
    amountLabel: "Amount Withdrawn:",
    cashierLabel: "Cashier:",
    supervisorLabel: "Supervisor:",
    summary: "Funds withdrawal",
    footer: "Funds withdrawn.",
  },
  pt: {
    title: "Retirada de Fundos",
    reasonLabel: "Motivo:",
    amountLabel: "Valor Retirado:",
    cashierLabel: "Caixa:",
    supervisorLabel: "Supervisor:",
    summary: "Retirada de fundos",
    footer: "Dinheiro retirado.",
  },
};

interface WithdrawalTicketProps {
  amount: number;
  reason: string;
  cashierName?: string;
  supervisorName?: string;
}

const WithdrawalTicket: React.FC<WithdrawalTicketProps> = ({
  amount,
  reason,
  cashierName,
  supervisorName,
}) => {
  const { currentLanguage, t } = useGlobalLanguage();
  const copy =
    WITHDRAWAL_TICKET_COPY[
      currentLanguage as keyof typeof WITHDRAWAL_TICKET_COPY
    ] || WITHDRAWAL_TICKET_COPY.en;
  const locale = t("__locale__", "common") || "es-AR";
  const formattedAmount = new Intl.NumberFormat(String(locale), {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(amount || 0);

  return (
    <div
      id="withdrawal-ticket"
      className="w-full max-w-md px-8 py-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
    >
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-lg font-bold tracking-wide">{copy.title}</h2>
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
        {cashierName && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600 dark:text-slate-400">
              {copy.cashierLabel}
            </span>
            <span className="font-semibold text-right">{cashierName}</span>
          </div>
        )}
        {supervisorName && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600 dark:text-slate-400">
              {copy.supervisorLabel}
            </span>
            <span className="font-semibold text-right">{supervisorName}</span>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
        <p className="text-sm font-semibold">{copy.summary}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{reason}</p>
      </div>
    </div>
  );
};

export default WithdrawalTicket;
