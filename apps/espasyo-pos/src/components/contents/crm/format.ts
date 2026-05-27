import { CustomerSegment } from "core-lib/api/crm";
import { SEGMENT_CONFIG } from "./constants";

export const formatSegmentLabel = (segment: CustomerSegment | number | null | undefined): string => {
  if (segment == null) return "—";
  const cfg = SEGMENT_CONFIG[segment as CustomerSegment];
  return cfg ? cfg.label : "—";
};

export const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatRelativeDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return formatDate(iso);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? "" : "s"} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? "" : "s"} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) === 1 ? "" : "s"} ago`;
};

export const formatBirthday = (mmdd: string | null | undefined): string => {
  if (!mmdd) return "—";
  const m = mmdd.match(/^(\d{2})-(\d{2})$/);
  if (!m) return mmdd;
  const monthIdx = parseInt(m[1], 10) - 1;
  const day = parseInt(m[2], 10);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  if (monthIdx < 0 || monthIdx > 11) return mmdd;
  return `${months[monthIdx]} ${day}`;
};

/** Average order value derived from totals when not provided directly. */
export const computeAOV = (totalSpend: number, totalVisits: number): number => {
  if (!totalVisits || totalVisits <= 0) return 0;
  return totalSpend / totalVisits;
};
