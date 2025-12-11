'use client';

import { useNotifications } from '@/app/components/NotificationProvider';
import { getNotificationConfig, createRetryAction, createHelpAction } from '@/lib/errorNotifications';
import type { NotificationType } from '@/app/components/NotificationProvider';

export function useErrorHandler() {
  const { addNotification } = useNotifications();

  const handleError = (
    errorCode: string,
    retryFn?: () => void,
    helpUrl?: string
  ) => {
    try {
      const config = getNotificationConfig(errorCode as any);
      
      let action = undefined;
      if (retryFn) {
        action = createRetryAction(retryFn);
      } else if (helpUrl) {
        action = createHelpAction(helpUrl);
      }

      addNotification({
        ...config,
        action,
      });
    } catch (e) {
      // Fallback for unknown error codes
      addNotification({
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
        type: 'error',
        duration: 8000,
      });
    }
  };

  const handleSuccess = (
    message: string,
    title: string = 'Success'
  ) => {
    addNotification({
      title,
      message,
      type: 'success' as NotificationType,
      duration: 5000,
    });
  };

  const handleWarning = (
    message: string,
    title: string = 'Warning'
  ) => {
    addNotification({
      title,
      message,
      type: 'warning' as NotificationType,
      duration: 6000,
    });
  };

  const handleInfo = (
    message: string,
    title: string = 'Information'
  ) => {
    addNotification({
      title,
      message,
      type: 'info' as NotificationType,
      duration: 5000,
    });
  };

  const handleApiError = (
    error: any,
    context?: string,
    retryFn?: () => void
  ) => {
    let errorCode = 'SERVER_ERROR';
    let customMessage = '';

    if (error?.response?.status === 401) {
      errorCode = 'UNAUTHORIZED';
    } else if (error?.response?.status === 403) {
      errorCode = 'FORBIDDEN';
    } else if (error?.response?.status === 404) {
      errorCode = 'ROLE_NOT_FOUND';
    } else if (error?.response?.data?.errorCode) {
      errorCode = error.response.data.errorCode;
    } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      errorCode = 'NETWORK_ERROR';
    }

    // Add context to message if provided
    if (context) {
      customMessage = ` (${context})`;
    }

    handleError(errorCode, retryFn);
  };

  const handleFileUploadErrors = (results: any[]) => {
    const errors = results.filter(r => r.error);
    const successes = results.filter(r => !r.error);

    if (successes.length > 0) {
      handleSuccess(
        `${successes.length} resume(s) processed successfully`,
        'Upload Complete'
      );
    }

    errors.forEach(error => {
      if (error.errorCode) {
        handleError(error.errorCode);
      } else {
        addNotification({
          title: 'File Processing Error',
          message: error.error || 'Failed to process file',
          type: 'error',
          duration: 8000,
        });
      }
    });

    // Show summary if mixed results
    if (errors.length > 0 && successes.length > 0) {
      handleWarning(
        `${errors.length} file(s) failed to process. Check individual notifications for details.`,
        'Partial Upload Success'
      );
    }
  };

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
    handleApiError,
    handleFileUploadErrors,
  };
}