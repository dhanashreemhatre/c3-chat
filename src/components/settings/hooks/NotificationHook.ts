import { useState } from 'react';

export function useNotifications() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  return {
    error,
    success,
    showError,
    showSuccess,
    clearError,
    clearSuccess,
  };
}