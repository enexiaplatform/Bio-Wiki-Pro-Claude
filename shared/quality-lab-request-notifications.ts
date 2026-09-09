import { z } from "zod";

export const commercialRequestDispatchStateSchema = z.enum(["queued", "unavailable", "failed"]);

export const commercialRequestNotificationStatusSchema = z.object({
  buyerAcknowledgement: commercialRequestDispatchStateSchema,
  ownerAlert: commercialRequestDispatchStateSchema,
});

export type CommercialRequestDispatchState = z.infer<typeof commercialRequestDispatchStateSchema>;
export type CommercialRequestNotificationStatus = z.infer<typeof commercialRequestNotificationStatusSchema>;
