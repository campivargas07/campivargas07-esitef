export type PayPalSdkMode = "live" | "sandbox";

export type PayPalCardSubmitState = "succeeded" | "canceled" | "failed";

export type PayPalCardSubmitResult = {
  state: PayPalCardSubmitState;
  data?: {
    orderId?: string;
    message?: string;
    liabilityShift?: string;
  };
};

export type PayPalCardFieldsSession = {
  createCardFieldsComponent: (options: {
    type: "number" | "expiry" | "cvv";
    placeholder?: string;
  }) => HTMLElement;
  submit: (
    orderId: string,
    options?: { billingAddress?: { postalCode?: string } }
  ) => Promise<PayPalCardSubmitResult>;
};

export type PayPalPaymentSession = {
  start: (
    options: { presentationMode?: "auto" | "modal" | "popup" | "redirect" },
    createOrder: () => Promise<{ orderId: string }>
  ) => Promise<void>;
};

export type PayPalEligibleMethods = {
  isEligible: (method: string) => boolean;
};

export type PayPalSdkInstance = {
  findEligibleMethods: (options?: {
    currencyCode?: string;
  }) => Promise<PayPalEligibleMethods>;
  createCardFieldsOneTimePaymentSession: () => PayPalCardFieldsSession;
  createPayPalOneTimePaymentSession: (options: {
    onApprove: (data: { orderId: string }) => void | Promise<void>;
    onCancel?: (data: unknown) => void;
    onError?: (error: unknown) => void;
  }) => PayPalPaymentSession;
};

declare global {
  interface Window {
    paypal?: {
      createInstance: (options: {
        clientId: string;
        components?: string[];
        pageType?: string;
        locale?: string;
      }) => Promise<PayPalSdkInstance>;
    };
  }

  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export {};
