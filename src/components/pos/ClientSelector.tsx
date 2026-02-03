import React, { useEffect, useState } from "react";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { apiFetch } from "@/lib/utils/apiFetch";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { toast } from "react-toastify";

interface Client {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface ClientSelectorProps {
  value: Client | null;
  onChange: (client: Client | null) => void;
  selectRef?: React.RefObject<HTMLSelectElement>;
  selectedClientId?: string | null;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
  value,
  onChange,
  selectRef,
  selectedClientId,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const { t } = useGlobalLanguage();
  const { subscription } = useSubscription();
  const planId = subscription?.planId || "BASIC";
  const maxClients = subscription?.features?.maxClients;
  const isClientsEnabled =
    typeof maxClients === "number"
      ? maxClients > 0
      : planId === "PROFESSIONAL" || planId === "ENTERPRISE";
  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      try {
        const res = await apiFetch("/api/clients", { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          setClients(data.data?.clients || data.clients || []);
        } else {
          const error = await res.json().catch(() => ({}));
          toast.error(
            t("messages.clientFetchError", "pos") !==
              "messages.clientFetchError"
              ? t("messages.clientFetchError", "pos")
              : error?.error || "Error al cargar clientes",
          );
          setClients([]);
        }
      } catch (e) {
        toast.error(
          t("messages.clientFetchError", "pos") !== "messages.clientFetchError"
            ? t("messages.clientFetchError", "pos")
            : "Error al cargar clientes",
        );
        setClients([]);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, [t]);

  useEffect(() => {
    if (!selectedClientId || value || clients.length === 0) return;
    const normalizedSelectedId = String(selectedClientId);
    const match = clients.find(
      (client) => String(client._id) === normalizedSelectedId,
    );
    if (match) {
      onChange(match);
    }
  }, [clients, onChange, selectedClientId, value]);

  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
        {t("labels.customer", "pos") !== "labels.customer"
          ? t("labels.customer", "pos")
          : "Cliente"}
      </label>
      <select
        ref={selectRef}
        className="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-gray-100"
        value={value?._id ? String(value._id) : ""}
        onChange={(e) => {
          const selectedId = String(e.target.value || "");
          const selected =
            clients.find((c) => String(c._id) === selectedId) || null;
          onChange(selected);
        }}
        disabled={loading}
      >
        <option value="">
          {loading
            ? t("messages.loading", "pos")
            : t("messages.selectClient", "pos") !== "messages.selectClient"
              ? t("messages.selectClient", "pos")
              : "Seleccionar cliente..."}
        </option>
        {clients.map((client) => (
          <option key={String(client._id)} value={String(client._id)}>
            {client.name} {client.email ? `(${client.email})` : ""}
          </option>
        ))}
        {!loading && clients.length === 0 && (
          <option value="" disabled>
            {!isClientsEnabled
              ? t("messages.clientsUpgradeRequired", "pos") !==
                "messages.clientsUpgradeRequired"
                ? t("messages.clientsUpgradeRequired", "pos")
                : "Búsqueda de clientes disponible solo en el plan Pro"
              : t("messages.noClients", "pos") !== "messages.noClients"
                ? t("messages.noClients", "pos")
                : "No hay clientes"}
          </option>
        )}
      </select>
      {!loading && clients.length === 0 && !isClientsEnabled && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          {t("messages.clientsUpgradeRequired", "pos") !==
          "messages.clientsUpgradeRequired"
            ? t("messages.clientsUpgradeRequired", "pos")
            : "Búsqueda de clientes disponible solo en el plan Pro"}
        </p>
      )}
    </div>
  );
};

export default ClientSelector;
