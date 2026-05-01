// src/utils/useToast.js
import { useState, useCallback } from 'react';

/**
 * Hook simple pour afficher des toasts de notification
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return { toast, showToast };
}
