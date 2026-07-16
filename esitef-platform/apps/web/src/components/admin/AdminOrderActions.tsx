"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/lib/admin-orders-shared";
import { orderStatusLabel } from "@/lib/admin-orders-shared";

type Props = {
  orderId: string;
  currentStatus: OrderStatus;
};

const STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "cancelled",
];

export function AdminOrderActions({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function updateStatus(next: OrderStatus) {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        status?: OrderStatus;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo actualizar el pedido.");
      }
      setStatus(data.status ?? next);
      setMessage({ type: "success", text: "Pedido actualizado." });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error inesperado.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-actions">
      {message && (
        <div className={`admin-flash admin-flash--${message.type}`}>
          {message.text}
        </div>
      )}

      <label htmlFor="order-status-select">
        <span className="sr-only">Estado del pedido</span>
        <select
          id="order-status-select"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          disabled={loading}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {orderStatusLabel(s)}
            </option>
          ))}
        </select>
      </label>

      <div className="admin-actions-row">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          disabled={loading || status === currentStatus}
          onClick={() => updateStatus(status)}
        >
          Guardar estado
        </button>
        {currentStatus !== "paid" && (
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            disabled={loading}
            onClick={() => updateStatus("paid")}
          >
            Marcar pagado
          </button>
        )}
        {currentStatus === "pending" && (
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            disabled={loading}
            onClick={() => updateStatus("cancelled")}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
