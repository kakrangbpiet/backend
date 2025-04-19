
import { z } from "zod";
import { accountStatus, UserCategory } from "../DataTypes/enums/IUserEnums.js";

export const InitSuperAdminSchema = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
  phoneNumber: z.string()
    .nonempty({ message: "Phone number is required" }) // Custom error message for empty phone number
    .regex(/^\d{10}$/, { message: "Phone number must be 10 digits" }), // Custom error message for invalid phone number format

})

export const RegisterUserSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email format" }) // Custom error message for invalid email
    .nonempty({ message: "Email is required" }), // Custom error message for empty email
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" }) // Custom error message for short password
    .nonempty({ message: "Password is required" }), // Custom error message for empty password
  accountStatus: z.enum([
    accountStatus.Pending,
  ], { message: "Invalid account status" }), // Custom error message for invalid account status
  name: z.string()
    .nonempty({ message: "Name is required" }), // Custom error message for empty name
  phoneNumber: z.string()
    .nonempty({ message: "Phone number is required" }) // Custom error message for empty phone number
    .regex(/^\d{10}$/, { message: "Phone number must be 10 digits" }), // Custom error message for invalid phone number format
  address: z.string()
    .nonempty({ message: "Address is required" }), // Custom error message for empty address
  category: z.string()
    .nonempty({ message: "Category is required" }), // Custom error message for empty category
});

export const RegisterPasswordLessUserSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email format" }) // Custom error message for invalid email
    .nonempty({ message: "Email is required" }), // Custom error message for empty email
  accountStatus: z.enum([
    accountStatus.Pending,
  ], { message: "Invalid account status" }), // Custom error message for invalid account status
  name: z.string()
    .nonempty({ message: "Name is required" }), // Custom error message for empty name
  phoneNumber: z.string()
    .nonempty({ message: "Phone number is required" }) // Custom error message for empty phone number
    .regex(/^\d{10}$/, { message: "Phone number must be 10 digits" }), // Custom error message for invalid phone number format
  address: z.string()
    .nonempty({ message: "Address is required" }), // Custom error message for empty address
  category: z.string()
    .nonempty({ message: "Category is required" }), // Custom error message for empty category
});


export const UserUpdateScehma = z.object({
  email: z.string(),
  accountStatus: z.enum([
    accountStatus.Approved,
    accountStatus.Rejected,
    accountStatus.Pending,
    accountStatus.Blocked
  ]),
});

export const LoginUser = z.object({
  email: z.string(),
  password: z.string()
})

export const ResetPasswordSchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters long"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters long"),
  trxId: z.string(),
  deviceId: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});


export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(8, { message: "Current password must be at least 8 characters long" }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters long" }),
  confirmPassword: z.string().min(8, { message: "Confirm password must be at least 8 characters long" }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New password and confirm password must match",
  path: ["confirmPassword"],
});