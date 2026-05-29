export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatKey(key: string): string {
  return key.toUpperCase();
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "text-emerald-400";
    case "disabled":
      return "text-red-400";
    case "expired":
      return "text-yellow-400";
    default:
      return "text-zinc-400";
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case "active":
      return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
    case "disabled":
      return "bg-red-400/10 text-red-400 border-red-400/20";
    case "expired":
      return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20";
    default:
      return "bg-zinc-400/10 text-zinc-400 border-zinc-400/20";
  }
}
