import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function accelerationToRichter(acceleration: number): {
  intensity: number;
  description: string;
} {
  acceleration = (acceleration/50);
  // Acceleration should be in g units
  if (acceleration < 0.0017) {
    return { intensity: 1, description: 'Not felt' };
  } else if (acceleration < 0.014) {
    return { intensity: 2.5, description: 'Weak' };  // Average of II-III
  } else if (acceleration < 0.039) {
    return { intensity: 4, description: 'Light' };
  } else if (acceleration < 0.092) {
    return { intensity: 5, description: 'Moderate' };
  } else if (acceleration < 0.18) {
    return { intensity: 6, description: 'Strong' };
  } else if (acceleration < 0.34) {
    return { intensity: 7, description: 'Very strong' };
  } else if (acceleration < 0.65) {
    return { intensity: 8, description: 'Severe' };
  } else if (acceleration < 1.24) {
    return { intensity: 9, description: 'Violent' };
  } else {
    return { intensity: 10, description: 'Extreme' };
  }
}
