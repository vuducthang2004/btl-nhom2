export const Role = {
  OWNER: 'OWNER',
  CASHIER: 'CASHIER',
  BARISTA: 'BARISTA',
} as const;

export type Role = (typeof Role)[keyof typeof Role];
