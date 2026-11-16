import ActionButton from "./ActionButton";

/** The buttons a staff member sees for one order, depending on its status and payment. */
export default function OrderActions({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: number;
  status: string;
  paymentStatus: string | null;
}) {
  const statusUrl = `/api/staff/orders/${orderId}/status`;
  const next: Record<string, { to: string; label: string }> = {
    Pending: { to: "Preparing", label: "Start preparing" },
    Preparing: { to: "Ready", label: "Mark ready" },
    Ready: { to: "Completed", label: "Mark completed" },
  };
  const step = next[status];
  const canCancel = status === "Pending" || status === "Preparing";
  const payPending = paymentStatus === "Pending" && status !== "Cancelled";

  return (
    <div className="flex flex-wrap items-start gap-2">
      {payPending && <ActionButton url={`/api/staff/orders/${orderId}/payment`} label="Confirm payment received" />}
      {step && <ActionButton url={statusUrl} body={{ status: step.to }} label={step.label} tone="primary" />}
      {canCancel && (
        <ActionButton url={statusUrl} body={{ status: "Cancelled" }} label="Cancel" tone="danger" confirmText={`Cancel order #${orderId}?`} />
      )}
    </div>
  );
}
