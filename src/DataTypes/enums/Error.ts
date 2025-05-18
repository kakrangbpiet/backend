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


export const TwilioError = {
    MissingCredentials: (): ErrorObject => ({
        statusCode: 500,
        message: "Twilio credentials not configured",
        details: "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required"
    }),
    MissingServiceSid: (): ErrorObject => ({
        statusCode: 500,
        message: "Twilio Verify Service SID not configured",
        details: "TWILIO_VERIFY_SERVICE_SID is required"
    }),
    MissingFromNumber: (): ErrorObject => ({
        statusCode: 500,
        message: "Twilio From Number not configured",
        details: "TWILIO_FROM_NUMBER is required"
    }),
    InitializationError: (error: unknown): ErrorObject => ({
        statusCode: 500,
        message: "Twilio service initialization failed",
        details: error
    }),
    InvalidPhoneNumber: (): ErrorObject => ({
        statusCode: 400,
        message: "Invalid phone number",
        details: "The provided phone number is not valid"
    }),
    InvalidOtp: (): ErrorObject => ({
        statusCode: 400,
        message: "Invalid OTP",
        details: "The provided OTP is not valid"
    }),
    OtpVerificationFailed: (): ErrorObject => ({
        statusCode: 400,
        message: "OTP verification failed",
        details: "The OTP could not be verified"
    }),
    SendOtpError: (error: unknown): ErrorObject => ({
        statusCode: 500,
        message: "Failed to send OTP",
        details: error
    }),
    VerificationError: (error: unknown): ErrorObject => ({
        statusCode: 500,
        message: "OTP verification error",
        details: error
    }),
    SmsSendError: (error: unknown): ErrorObject => ({
        statusCode: 500,
        message: "Failed to send SMS",
        details: error
    }),
    ServiceNotFound: (serviceSid: string): ErrorObject => ({
        statusCode: 500,
        message: "Twilio Verify Service not found",
        details: `Service SID: ${serviceSid}`
    }),
    MaxAttemptsReached: (): ErrorObject => ({
        statusCode: 500,
        message: "Max OTP attempts reached",
        details: "Too many OTP attempts, please try again later"
    }),
    InvalidVerificationParams: (): ErrorObject => ({
        statusCode: 400,
        message: "Invalid verification parameters",
        details: "Phone number and OTP are required"
    }),
    InvalidResendParams: (): ErrorObject => ({
        statusCode: 400,
        message: "Invalid resend parameters",
        details: "Phone number and transaction ID are required"
    }),
    ResendOtpError: (error: unknown): ErrorObject => ({
        statusCode: 500,
        message: "Failed to resend OTP",
        details: error
    }),
    UnverifiedNumber: (): ErrorObject => ({
        statusCode: 400,
        message: "Unverified phone number",
        details: "This number is not verified for SMS sending"
    }),
    OtpExpired: (): ErrorObject => ({
        statusCode: 400,
        message: "OTP expired",
        details: "The OTP has expired, please request a new one"
    }),
};


export const BlockchainError = {
    MissingPrivateKey: (): ErrorObject => ({
        statusCode: 400,
        message: "Missing Private Key",
        details: "A valid private key must be provided to execute this action."
    }),
    MissingContractNameOrPrivateKey: (): ErrorObject => ({
        statusCode: 400,
        message: "Missing Contract Name or Private Key",
        details: "Both contract name and private key must be provided."
    }),
    HardhatError: (hardhatError:any): ErrorObject => ({
        statusCode: 400,
        message: "Error interacting with blockchain",
        details: hardhatError
    }),
    MissingrpcUrl : (): ErrorObject =>({
        statusCode: 400,
        message: "Rpc Url Required",
        details: "A valid Rpc endpoint is needed to interact with blockchain."
    })
    // Add other specific blockchain-related errors as needed
};