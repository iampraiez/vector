import * as z from "zod";

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignInValues = z.infer<typeof signInSchema>;

export const signUpFleetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z
    .string()
    .min(2, "Full name is too short")
    .max(50, "Full name is too long"),
  company_name: z
    .string()
    .min(2, "Company name is too short")
    .max(100, "Company name is too long"),
  plan_id: z.string().min(1, "Please select a plan"),
});

export type SignUpFleetValues = z.infer<typeof signUpFleetSchema>;

export const signUpDriverSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z
    .string()
    .min(2, "Full name is too short")
    .max(50, "Full name is too long"),
  phone: z
    .string()
    .regex(
      /^\+\d{1,3}\d{10}$/,
      "Phone number must be in format +2349166072665",
    ),
  company_code: z
    .string()
    .min(6, "Company code must be 6 characters")
    .max(12, "Company code is too long"),
  vehicle_type: z.string().optional(),
  vehicle_plate: z
    .string()
    .min(2, "Plate number is too short")
    .max(15, "Plate number is too long")
    .optional(),
});

export type SignUpDriverValues = z.infer<typeof signUpDriverSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
