import { NextResponse } from 'next/server';

export interface ApiResponseData<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    errors?: unknown;
}

export const sendSuccess = <T>(
    message: string,
    data?: T,
    statusCode = 200,
): NextResponse<ApiResponseData<T>> => {
    return NextResponse.json(
        { success: true, message, data },
        { status: statusCode },
    );
};

export const sendError = (
    message: string,
    statusCode = 500,
    errors?: unknown,
): NextResponse<ApiResponseData> => {
    return NextResponse.json(
        { success: false, message, errors },
        { status: statusCode },
    );
};
