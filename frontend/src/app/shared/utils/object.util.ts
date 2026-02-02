export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : undefined;
  }, obj);
}
