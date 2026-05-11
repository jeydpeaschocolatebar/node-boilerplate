export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    code?: string;
}

export function successResponse<T>(data: T, message = 'OK'): ApiResponse<T> {
    return { success: true, message, data };
}

export function errorResponse(message: string, code?: string): ApiResponse {
    return { success: false, message, ...(code && { code }) };
}
