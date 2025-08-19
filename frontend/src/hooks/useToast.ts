import { Toast, ToastMessage } from "primereact/toast";
import { useCallback, useRef } from "react";

export function useToast(): [React.RefObject<Toast | null>, (message: ToastMessage) => void] {
  const toast = useRef<Toast>(null);

  return [
    toast,
    useCallback((message: ToastMessage) => {
      toast.current?.show(message);
    }, []),
  ];
}
