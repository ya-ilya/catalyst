import { Toast, ToastMessage } from "primereact/toast";
import { createContext, ReactNode, useCallback, useContext, useRef } from "react";

export function useToastContext() {
  return useContext(ToastContext);
}

export const ToastContext = createContext<[showToast: (message: ToastMessage) => void]>([() => {}]);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const toast = useRef<Toast>(null);

  const showToast = useCallback((message: ToastMessage) => {
    toast.current?.show(message);
  }, []);

  return (
    <ToastContext.Provider value={[showToast]}>
      <Toast ref={toast} />
      {children}
    </ToastContext.Provider>
  );
};
