const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });
export const formatMoney = (n: number) => inr.format(n);

const dt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });
export const formatDateTime = (d: Date | string) => dt.format(new Date(d));
