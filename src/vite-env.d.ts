/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_PAYPAL_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    paypal: {
      Buttons: (config: {
        createOrder: (
          data: unknown,
          actions: { order: { create: (order: { purchase_units: { amount: { value: string } }[] }) => unknown } }
        ) => unknown;
        onApprove: (
          data: { orderID: string },
          actions: { order: { capture: () => Promise<{ resultCode: string }> } }
        ) => Promise<void>;
        onError: (err: unknown) => void;
      }) => { render: (container: string) => void };
    };
  }
}

export {};
