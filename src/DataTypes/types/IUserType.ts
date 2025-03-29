


export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type StatusCodeType = 200 | 201 | 400 | 401 | 403 | 404 | 500;

export interface ErrorObject {
    statusCode: StatusCodeType;
    message: string;
    details: unknown;
}