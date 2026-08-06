export const requiredRule = (val: unknown) =>
  (typeof val === 'string' && val.trim().length > 0) ||
  typeof val === 'number' ||
  'Обязательное поле'

export const requiredMatchRule = (val: unknown) =>
  val !== null || 'Обязательное поле'

export const emailRule = (val: string) =>
  /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(val) || 'Введите корректный email'
