import z from "zod";

export const bookingSchema = z.object({
  carName: z.string(),
  days: z.number().min(1).max(365),
  rentPerDay: z.number().min(1).max(2000),
});
