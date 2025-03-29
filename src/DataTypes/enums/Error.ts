import { ErrorObject } from "../types/IUserType";

export const DbError = {
    ErrorOfMongoose: (): ErrorObject => ({
        statusCode: 400,
        message: "Check Form Data",
        details: `Oho. Error Via Prisma. Check if database is working Properly. `
    }),
    InvalidDataTypes: (ErrorInfo: unknown, path?: unknown): ErrorObject => ({
        statusCode: 400,
        message: "Check Form Data",
        details: `Invalid details provided. ${JSON.stringify(ErrorInfo)} for ${path} `
    }),
    DatabaseConnectionError: (): ErrorObject => ({
        statusCode: 400,
        message: "Prisma is not connected",
        details: ""
    }),
}

export const ErrorEnum = {
    InvalidJwt: (err: unknown): ErrorObject => ({
        statusCode: 400,
        message: `Invalid User JWT`,
        details: err
    }),
    InvalidJwtSecret: (): ErrorObject => ({
        statusCode: 400,
        message: `Invalid JWT SECRET`,
        details: ""
    }),
    SignUpValidationError: (data: unknown): ErrorObject => ({
        statusCode: 400,
        message: `Not Availabale '${data}'`,
        details: ""
    }),
  
};
