export type PayPalSdkMode = "live" | "sandbox";

export type PayPalCardFieldsBillingAddress = {
  addressLine1?: string;
  addressLine2?: string;
  adminArea1?: string;
  adminArea2?: string;
  countryCode: string;
  postalCode: string;
};

export type PayPalCardFieldsSubmitOptions = {
  billingAddress?: PayPalCardFieldsBillingAddress;
  cardholderName?: string;
};

export type PayPalCardFieldStateField = {
  isValid?: boolean;
  isEmpty?: boolean;
  isFocused?: boolean;
  isPotentiallyValid?: boolean;
};

export type PayPalCardFieldEvent = {
  emittedBy?: string;
  fields?: Record<string, PayPalCardFieldStateField>;
};

export type PayPalCardFieldOptions = {
  placeholder?: string;
  style?: Record<string, Record<string, string>>;
  inputEvents?: {
    onChange?: (event: PayPalCardFieldEvent) => void;
    onFocus?: (event: PayPalCardFieldEvent) => void;
    onBlur?: (event: PayPalCardFieldEvent) => void;
    onInputSubmitRequest?: (event: PayPalCardFieldEvent) => void;
  };
};

export type PayPalCardField = {
  render: (target: string | HTMLElement) => Promise<void>;
  close?: () => Promise<void>;
};

export type PayPalCardFieldsInstance = {
  isEligible: () => boolean;
  NameField: (options?: PayPalCardFieldOptions) => PayPalCardField;
  NumberField: (options?: PayPalCardFieldOptions) => PayPalCardField;
  ExpiryField: (options?: PayPalCardFieldOptions) => PayPalCardField;
  CVVField: (options?: PayPalCardFieldOptions) => PayPalCardField;
  submit: (options?: PayPalCardFieldsSubmitOptions) => Promise<void>;
};

export type PayPalCardFieldsOptions = {
  style?: Record<string, Record<string, string>>;
  createOrder: () => Promise<string> | string;
  onApprove: (data: { orderID: string }) => void | Promise<void>;
  onCancel?: () => void;
  onError?: (err: unknown) => void;
};

/** @deprecated Prefer CardFields; kept for typing leftover references. */
export type PayPalHostedFieldsInstance = {
  submit: (options?: unknown) => Promise<{ orderId: string }>;
  teardown: () => Promise<void>;
  on: (event: string, handler: (payload: unknown) => void) => void;
  getState: () => unknown;
};

export type PayPalButtonsStyle = {
  layout?: "vertical" | "horizontal";
  color?: "gold" | "blue" | "silver" | "white" | "black";
  shape?: "rect" | "pill";
  label?: "paypal" | "checkout" | "pay" | "buynow";
  height?: number;
  tagline?: boolean;
};

export type PayPalButtonsOptions = {
  style?: PayPalButtonsStyle;
  createOrder: () => Promise<string> | string;
  onApprove: (data: {
    orderID: string;
    payerID?: string;
  }) => void | Promise<void>;
  onCancel?: (data: unknown) => void;
  onError?: (err: unknown) => void;
};

export type PayPalButtonsInstance = {
  render: (target: HTMLElement | string) => Promise<void>;
  close: () => Promise<void>;
  isEligible: () => boolean;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: PayPalButtonsOptions) => PayPalButtonsInstance;
      CardFields?: (options: PayPalCardFieldsOptions) => PayPalCardFieldsInstance;
      HostedFields?: {
        isEligible: () => boolean;
        render: (options: unknown) => Promise<PayPalHostedFieldsInstance>;
      };
    };
  }
}

export {};
