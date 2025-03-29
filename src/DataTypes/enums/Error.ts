import { IsystemAdmin } from "../Interfaces/IUser";
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
    MissingJwt: (): ErrorObject => ({
        statusCode: 400,
        message: `UnAuthorised User.`,
        details: `Missing JWT from the user`
    }),
    MissingAuth: (): ErrorObject => ({
        statusCode: 400,
        message: `UnAuthorised User.`,
        details: `Auth Header Is Not Present`
    }),
    Unauthorized: (): ErrorObject => ({
        statusCode: 404,
        message: "Un-Authorised User",
        details: ""
    }),
};


export const SuperAdminError = {
    SuperAdminInitError: (): ErrorObject => ({
        statusCode: 400,
        message: "A Super admin already exists.",
        details: ``
    }),
    ErrorCreatingUser: (): ErrorObject => ({
        statusCode: 400,
        message: "Unknown Error While creating Super Admin.",
        details: ``
    }),
    ErrorLoginSuperAdmin: (email: IsystemAdmin["email"]): ErrorObject => ({
        statusCode: 400,
        message: `System admin Not initialise with email ${email}.`,
        details: ``
    }),
}