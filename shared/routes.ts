import { z } from 'zod';
import { insertQuoteRequestSchema, quoteRequests, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  quoteRequests: {
    create: {
      method: 'POST' as const,
      path: '/api/quotes' as const,
      input: insertQuoteRequestSchema,
      responses: {
        201: z.custom<typeof quoteRequests.$inferSelect>(),
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
