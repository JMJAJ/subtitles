// src/webpack/common.ts
export const Toasts = {
    Type: {
      FAILURE: "failure",
      SUCCESS: "success"
    }
  };
  
  export function showToast(message: string, type: string) {
    // For demo purposes, simply log to console
    console.log(`[${type}]: ${message}`);
  }
  