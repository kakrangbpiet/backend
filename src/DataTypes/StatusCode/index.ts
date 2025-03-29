
export const statusCodes: { [key: number]: { label: string, message: string } } = {
    200: { label: 'OK', message: 'Request processed successfully' },
    201: { label: 'Success', message: 'Success for the api.' },
    400: { label: 'Bad Request', message: 'Invalid request format' },
    401: { label: 'Unauthorized', message: 'Authentication required' },
    403: { label: 'Forbidden', message: 'Access forbidden' },
    404: { label: 'Not Found', message: 'Resource not found' },
    415: { label: 'Unsupported Type', message: 'Wrong data Type Sent' },
    500: { label: 'Internal Server Error', message: 'An internal server error occurred' },
    // Add more status codes and messages as needed
  };
  
  export const logLevels: { [key: string]: number[] } = {
    info: [200,201], 
    warn: [400],
    error: [401, 403, 404, 500],
    http:[],
    debug:[],
    verbose:[],
    silly:[]
  };