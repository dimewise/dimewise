export function getEnumFromString<T extends Record<string, string>>(enumObj: T, value: string): T[keyof T] | undefined {
  // Check if the value exists in the enum's values
  return Object.values(enumObj).includes(value) ? (value as T[keyof T]) : undefined;
}
