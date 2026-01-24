import { toast } from "react-toastify";

// This will be used by components with access to useLanguage hook
export interface ToastOptions {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
}

export const showToast = (
  message: string,
  type: "success" | "error" | "warning" | "info" = "info",
  duration: number = 3000,
) => {
  const toastConfig = {
    position: "bottom-right" as const,
    autoClose: duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  switch (type) {
    case "success":
      toast.success(message, toastConfig);
      break;
    case "error":
      toast.error(message, toastConfig);
      break;
    case "warning":
      toast.warning(message, toastConfig);
      break;
    case "info":
    default:
      toast.info(message, toastConfig);
      break;
  }
};
