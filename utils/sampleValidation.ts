import type { SampleFormInput } from '@/types/sample';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateSample(
  sample: SampleFormInput,
): ValidationResult {
  if (!sample.cloneNumber.trim()) {
    return {
      valid: false,
      message: 'Clone Number is required.',
    };
  }

  if (!sample.treeNumber.trim()) {
    return {
      valid: false,
      message: 'Tree Number is required.',
    };
  }

  if (!sample.leafNumber.trim()) {
    return {
      valid: false,
      message: 'Leaf Number is required.',
    };
  }

  const readings = [
    {
      name: 'Meter Reading 1',
      value: sample.meterReading1,
    },
    {
      name: 'Meter Reading 2',
      value: sample.meterReading2,
    },
    {
      name: 'Meter Reading 3',
      value: sample.meterReading3,
    },
  ];

  for (const reading of readings) {
    if (!reading.value.trim()) {
      return {
        valid: false,
        message: `${reading.name} is required.`,
      };
    }

    if (Number.isNaN(Number(reading.value))) {
      return {
        valid: false,
        message: `${reading.name} must be a valid number.`,
      };
    }
  }

  return {
    valid: true,
  };
}