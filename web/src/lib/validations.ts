import * as z from "zod";

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignInValues = z.infer<typeof signInSchema>;

export const signUpFleetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(2, "Full name is required"),
  company_name: z.string().min(2, "Company name is required"),
  plan_id: z.string().min(1, "Please select a plan"),
});

export type SignUpFleetValues = z.infer<typeof signUpFleetSchema>;

export const signUpDriverSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(2, "Full name is required"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  company_code: z.string().min(6, "Company code is required"),
  vehicle_type: z.string().optional(),
  vehicle_plate: z.string().optional(),
});

export type SignUpDriverValues = z.infer<typeof signUpDriverSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
