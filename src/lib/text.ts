/** Turn a manifest key ("gender", "outline") into a display label ("Gender", "Outline"). */
export function labelFor(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
