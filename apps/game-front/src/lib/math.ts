export function valueRemap(value: number, min: number, max: number, newMin: number, newMax: number) {
  return newMin + (newMax - newMin) * (value - min) / (max - min);
}
