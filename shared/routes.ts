import { z } from 'zod';
import { insertQuoteRequestSchema, quoteRequests } from './schema.js';
import { users } from './models/auth.js';
import { qualityLabReviewRequestSchema } from './quality-lab-review.js';
import { commercialRequestNotificationStatusSchema, type CommercialRequestNotificationStatus } from './quality-lab-request-notifications.js';

export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type CommercialRequestCreateResponse = typeof quoteRequests.$inferSelect & {
  notifications?: CommercialRequestNotificationStatus;
};
const commercialRequestCreateResponseSchema = z.custom<CommercialRequestCreateResponse>((value) => {
  if (!value || typeof value !== "object" || typeof (value as { id?: unknown }).id !== "number") return false;
  const notifications = (value as { notifications?: unknown }).notifications;
  return notifications === undefined || commercialRequestNotificationStatusSchema.safeParse(notifications).success;
});
const errorEnvelope = {
  code: z.string(),
  requestId: z.string(),
};
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
    ...errorEnvelope,
  }),
  notFound: z.object({
    message: z.string(),
    ...errorEnvelope,
  }),
  internal: z.object({
    message: z.string(),
    ...errorEnvelope,
  }),
};

export const api = {
  qualityLabReviews: {
    create: {
      method: 'POST' as const,
      path: '/api/quality-lab/reviews' as const,
      input: qualityLabReviewRequestSchema,
      responses: {
        201: commercialRequestCreateResponseSchema,
        400: errorSchemas.validation,
      },
    },
  },
  quoteRequests: {
    create: {
      method: 'POST' as const,
      path: '/api/quotes' as const,
      input: insertQuoteRequestSchema,
      responses: {
        201: commercialRequestCreateResponseSchema,
        400: errorSchemas.validation,
      },
    },
  },
  users: {
    me: {
      method: 'GET' as const,
      path: '/api/auth/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.notFound,
      },
    },
    togglePro: {
      method: 'POST' as const,
      path: '/api/users/toggle-pro' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
