import axios from 'axios';

export type ApiError = {
  message: string;
  status?: number;
  code?: string;
};

export function isApiError(error: unknown): error is ApiError {
  return Boolean(error && typeof error === 'object' && 'message' in error);
}

export function getApiErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  return toApiError(error).message;
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    let message = 'Something went wrong. Please try again.';

    if (status === 429) {
      message = 'Daily limit reached. Please try later or upgrade.';
    } else if (status && status >= 500) {
      message = 'Server error. Please try again shortly.';
    } else if (typeof detail === 'string' && detail.trim()) {
      message = detail;
    } else if (error.message) {
      message = error.message;
    }

    return {
      message,
      status,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'Unknown error' };
}
