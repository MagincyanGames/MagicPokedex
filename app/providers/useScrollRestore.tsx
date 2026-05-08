import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export default function useScrollRestore(dataReady: boolean) {
  const { pathname, state, search } = useLocation();
  const navigate = useNavigate();

  // RESTAURACIÓN
  useLayoutEffect(() => {
    // Solo restauramos si hay datos y hay un valor guardado en el state
    if (dataReady && state?.scrollY) {
      const scrollPos = state.scrollY;

      // El doble frame asegura que el grid de Tailwind ya se pintó
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollPos, behavior: 'instant' });
        });
      });
    }
  }, [dataReady, pathname]);
}
