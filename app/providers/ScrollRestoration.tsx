/**
 * Restores scroll position after a dynamic list finishes loading.
 * Call it in the list page, passing a flag for when data is ready.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

export function useScrollRestoration(isReady: boolean) {
  const location = useLocation();
  const restored = useRef(false);
  const storageKey = `scroll::${location.key}`;

  // Reset cuando cambia la página
  useEffect(() => {
    restored.current = false;
  }, [location.key]);

  // Restaurar cuando los datos estén listos
  useEffect(() => {
    if (!isReady || restored.current) return;

    const saved = sessionStorage.getItem(storageKey);
    if (saved != null) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: Number(saved), behavior: 'smooth' });
        restored.current = true;
        sessionStorage.removeItem(storageKey);
      });
    }
  }, [isReady, storageKey]);
}
