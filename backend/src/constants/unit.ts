export const Unit = {
  G: 'g',
  KG: 'kg',
  ML: 'ml',
  L: 'l',
  UNIT: 'unit',
  PACK: 'pack',
  SHOT: 'shot',
  PUMP: 'pump',
  TBSP: 'tbsp',
} as const;

export type Unit = (typeof Unit)[keyof typeof Unit];

export const UNIT_VALUES = Object.values(Unit);
