import {InitSuperAdminSchema, LoginUser, RegisterPasswordLessUserSchema, RegisterUserSchema, ResetPasswordSchema, UpdatePasswordSchema, UserUpdateScehma } from "../Schema/UserSchema.js";
import { DbError } from "../DataTypes/enums/Error.js";
import { logWithMessageAndStep } from "../Utils/Logger/logger.js";
import winston from "winston";
import { IsystemAdmin, IUser } from "../DataTypes/Interfaces/IUser.js";
import { encryptPassword } from "../Utils/scripts/encryptPassword.js";


export const SystemAdminValidation = {
  async validateAsync(data: IsystemAdmin,childLogger:any) {
    logWithMessageAndStep(childLogger, "Step 2", "Validating Form Input schema", "Create_superAdmin", JSON.stringify(data),"info");

    const parsed = InitSuperAdminSchema.safeParse(data);
    if (parsed.success) {
    logWithMessageAndStep(childLogger,"Step 3","Validated Data After zod schema check","Create_superAdmin","Password Hidden","debug")

      const { password } = data;
  
      const hashPassword = await encryptPassword(password,childLogger)
      parsed.data.password = hashPassword;
      logWithMessageAndStep(childLogger,"Step 4","Password Hashing after schema test","Create_superAdmin",JSON.stringify(hashPassword),"info")
  
      return parsed.data;
    }
    else{
      logWithMessageAndStep(childLogger,"Error Step","Failed Validating User","Create_superAdmin",JSON.stringify(data),"warn")
      throw DbError.InvalidDataTypes(parsed.error.issues[0].message, parsed.error.issues[0].path)
    }
  }
};

export const UserValidation = {
  async validateAsync(data: IUser,childLogger:any) {
    logWithMessageAndStep(childLogger,"Step 2","Validating Form Input schema","register",JSON.stringify(data),"info")
    
    const parsed = RegisterUserSchema.safeParse(data);
    logWithMessageAndStep(childLogger,"Step 3","Validated Data After zod schema check","register",JSON.stringify(parsed),"debug")
    if (parsed.success) {
      const { password } = data;
  
      const hashPassword = await encryptPassword(password,childLogger)
      parsed.data.password = hashPassword;
      logWithMessageAndStep(childLogger,"Step 4","Password Hashing after schema test","register",JSON.stringify(hashPassword),"info")
      return parsed.data as IUser;
    }
    else{
      logWithMessageAndStep(childLogger,"Error Step","Failed Validating User","register",JSON.stringify(data),"warn")
      throw DbError.InvalidDataTypes(parsed.error.issues[0].message, parsed.error.issues[0].path)
    }
  }
};
export const PasswordLessUserValidation = {
  async validateAsync(data: IUser,childLogger:any) {
    logWithMessageAndStep(childLogger,"Step 2","Validating Form Input schema","register",JSON.stringify(data),"info")
    
    const parsed = RegisterPasswordLessUserSchema.safeParse(data);
    logWithMessageAndStep(childLogger,"Step 3","Validated Data After zod schema check","register",JSON.stringify(parsed),"debug")
    if (parsed.success) {
      return parsed.data as IUser;
    }
    else{
      logWithMessageAndStep(childLogger,"Error Step","Failed Validating User","register",JSON.stringify(data),"warn")
      throw DbError.InvalidDataTypes(parsed.error.issues[0].message, parsed.error.issues[0].path)
    }
  }
};

export const UpdateUserValidation = {
  async validateAsync(data: IUser,childLogger:winston.Logger ) {
    logWithMessageAndStep(childLogger, "Step 2", "Validating FormData Schema to Update user", "updateUser", JSON.stringify(data),"info");

  const parsed = UserUpdateScehma.safeParse(data);
  if (parsed.success) {
    logWithMessageAndStep(childLogger,"Step 3","Validated Data After zod schema check","updateUser",JSON.stringify(parsed),"debug")
    return parsed.data as IUser;
  }
  else{
    logWithMessageAndStep(childLogger,"Error Step","Failed Validating User ","updateUser",JSON.stringify(data),"warn")
    throw DbError.InvalidDataTypes(parsed.error.issues[0].message, parsed.error.issues[0].path)
  }
  }
};

export const LoginValidation = {
  async validateAsync(data: IsystemAdmin, childLogger: any) {
      logWithMessageAndStep(childLogger, "Step 2", "Starting validation", "validateAsync", JSON.stringify(data.email), "info");

      const parsed = LoginUser.safeParse(data);
      logWithMessageAndStep(childLogger, "Step 3", "Parsing validation result", "validateAsync", JSON.stringify(parsed.data?.email), "info");

      if (parsed.success) {
          logWithMessageAndStep(childLogger, "Step 4", "Validation successful", "validateAsync", JSON.stringify(data.email), "info");
          return parsed.data;
      } else {
          logWithMessageAndStep(childLogger, "Error Step", "Validation failed", "validateAsync", JSON.stringify(parsed.error.issues), "warn");
          throw DbError.InvalidDataTypes(parsed.error.issues[0].message, parsed.error.issues[0].path);
      }
  }
};


export const ResetPasswordValidation = {
  async validateAsync(data: any, childLogger: winston.Logger) {
    logWithMessageAndStep(childLogger, "Step 2", "Validating Form Input schema", "resetPassword", JSON.stringify(data), "info");

    const parsed = ResetPasswordSchema.safeParse(data);
    if (parsed.success) {
      logWithMessageAndStep(childLogger, "Step 3", "Validated Data After zod schema check", "resetPassword", JSON.stringify(parsed), "debug");

      const { newPassword } = data;

      const hashPassword = await encryptPassword(newPassword, childLogger);
      parsed.data.newPassword = hashPassword;
      logWithMessageAndStep(childLogger, "Step 4", "Password Hashing after schema test", "resetPassword", JSON.stringify(hashPassword), "info");

      return parsed.data;
    } else {
      logWithMessageAndStep(childLogger, "Error Step", "Failed Validating User", "resetPassword", JSON.stringify(data), "warn");
      throw DbError.InvalidDataTypes(parsed.error.issues[0].message, parsed.error.issues[0].path);
    }
  }
};

export const UpdatePasswordValidation = {
  async validateAsync(data: any, childLogger: winston.Logger) {
    logWithMessageAndStep(childLogger, "Step 2", "Validating Form Input schema", "updatePassword", JSON.stringify(data), "info");

    const parsed = UpdatePasswordSchema.safeParse(data);
    if (parsed.success) {
      logWithMessageAndStep(childLogger, "Step 3", "Validated Data After zod schema check", "updatePassword", JSON.stringify(parsed), "debug");

      const { newPassword } = data;

      const hashPassword = await encryptPassword(newPassword, childLogger);
      parsed.data.newPassword = hashPassword;
      logWithMessageAndStep(childLogger, "Step 4", "Password Hashing after schema test", "updatePassword", JSON.stringify(hashPassword), "info");

      return parsed.data;
    } else {
      logWithMessageAndStep(childLogger, "Error Step", "Failed Validating User", "updatePassword", JSON.stringify(data), "warn");
      throw DbError.InvalidDataTypes(parsed.error.issues[0].message, parsed.error.issues[0].path);
    }
  }
};