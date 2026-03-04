export const requiredRule = (val: unknown) =>
  (val !== null && val !== undefined && String(val).trim().length > 0) ||
  'Обязательное поле'

export const requiredMatchRule = (val: unknown) =>
  val !== null || 'Обязательное поле'

export const emailRule = (val: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Введите корректный email'
