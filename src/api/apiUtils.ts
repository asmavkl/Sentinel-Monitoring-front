import { isAxiosError } from 'axios';
import type { ApiResponse } from '@/types/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly errors?: string[] | null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data == null) {
    throw new ApiError(response.message ?? 'درخواست با خطا مواجه شد.', undefined, response.errors);
  }

  return response.data;
}

export async function requestApiData<T>(
  request: () => Promise<{ data: ApiResponse<T> }>,
): Promise<T> {
  try {
    const { data } = await request();
    return unwrapApiResponse(data);
  } catch (error) {
    throw toApiError(error);
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (isAxiosError(error)) {
    const status = error.response?.status;
    const payload = error.response?.data as ApiResponse<unknown> | undefined;

    if (status === 401) {
      return new ApiError('نشست شما معتبر نیست. لطفا از طریق درگاه وارد شوید.', 401);
    }

    if (!error.response) {
      return new ApiError('ارتباط با سرویس برقرار نشد. لطفا دوباره تلاش کنید.');
    }

    return new ApiError(
      payload?.message ?? error.message ?? 'درخواست با خطا مواجه شد.',
      status,
      payload?.errors,
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('خطای غیرمنتظره رخ داد.');
}

export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}

export function isUnauthorizedError(error: unknown): boolean {
  return toApiError(error).statusCode === 401;
}
