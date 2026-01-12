import z from "zod";

export const bookingSchema = z.object({
  carName: z.string(),
  days: z.number().min(1),
  rentPerDay: z.number().min(1),
});
