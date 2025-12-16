export type MediaAsset = {
  id: string;
  itemId: string;
  url: string;
  thumbUrl?: string | null;
  provider: string;
  publicId?: string | null;
  width?: number | null;
  height?: number | null;
  durationSec?: number | null;
  format?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MediaItem = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  eventDate?: string | null;
  type: "photo" | "video" | "document";
  createdAt: string;
  updatedAt: string;
  coverUrl?: string | null;
  thumbUrl?: string | null;
  assets: MediaAsset[];
};

export type Message = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  inquiryType: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  createdAt: string;
};

export type Payment = {
  id: string;
  reference: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "ABANDONED" | "REFUNDED";
  amount: number;
  amountMinor: number;
  currency: string;
  channel?: string | null;
  method?: string | null;
  donorName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  gatewayResponse?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Opportunity = {
  id: string;
  title: string;
  timeType: "Full-Time" | "Part-Time" | "Flexible" | "Remote";
  location?: string;
  description: string;
  skills: string[];
  status: "Active" | "Closed";
  createdAt: string;
};

// _types.ts
export type PayStats = {
  totalAmount: number;
  totalCount: number;
  byStatus: Record<string, number>;
  currency: string;
  // Optional, if your backend provides them:
  monthAmount?: number;
  monthCount?: number;
  successRate?: number;
  avgAmount?: number;
};

