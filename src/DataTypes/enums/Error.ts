import { IloginUser, IsystemAdmin, IUser } from "../Interfaces/IUser";
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
    ErrorOfPrisma: (err:any): ErrorObject => ({
        statusCode: 400,
        message: "Prisma Error",
        details: err
    }),
}

export const ErrorEnum = {
    InvalidJwt: (err: unknown): ErrorObject => ({
        statusCode: 400,
        message: `Invalid User JWT`,
        details: err
    }),
    InternalserverError: (err: unknown): ErrorObject => ({
        statusCode: 400,
        message: `Internal Server Error`,
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
    MissingEmail: (): ErrorObject => ({
        statusCode: 400,
        message: `Missing Email.`,
        details: `Email Is Not Present`
    }),
    MissingMobile: (): ErrorObject => ({
        statusCode: 400,
        message: `Missing Phone Number.`,
        details: `Phone Number Is Not Present`
    }),
    Unauthorized: (): ErrorObject => ({
        statusCode: 404,
        message: "Un-Authorised User",
        details: ""
    }),
    UserNotFoundwithEmail: (email: IloginUser['email'] | undefined): ErrorObject => ({
        statusCode: 404,
        message: `User with email '${email}' does not exist.`,
        details: ""
    }),
    UserNotFoundwithPhone: (phoneNumber: IUser['phoneNumber'] | undefined): ErrorObject => ({
        statusCode: 404,
        message: `User with phone '${phoneNumber}' does not exist.`,
        details: ""
    }),
    UserPasswordError: (email: IloginUser['email']): ErrorObject => ({
        statusCode: 401,
        message: `Wrong password received for '${email}' `,
        details: ""
    }),
    InvalidAccountCategory: (userEmail: IUser["email"] | undefined): ErrorObject => ({
        statusCode: 404,
        message: `Invalid Account Category for user '${userEmail}'`,
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

export const CommonError = {
    OtpServerError: (error?: any): ErrorObject => ({
        statusCode: 500,
        message: "unknown error while calling otp server",
        details: error
    }),
    OtpApiError: (error: any): ErrorObject => ({
        statusCode: error.code,
        message: error?.error,
        details: error
    }),
    MissingPhoneNumber: (): ErrorObject => ({
        statusCode: 400,
        message: "Phone number is required",
        details: ""
    }),
    MissingDeviceId: (): ErrorObject => ({
        statusCode: 400,
        message: "Device ID is required",
        details: ""
    }),
    MissingApiKey: (): ErrorObject => ({
        statusCode: 400,
        message: "API key is required",
        details: ""
    }),
    MissingOtp: (): ErrorObject => ({
        statusCode: 400,
        message: "OTP is required",
        details: ""
    }),
    MissingTransactionId: (): ErrorObject => ({
        statusCode: 400,
        message: "Transaction ID is required",
        details: ""
    })
};