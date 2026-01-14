import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static required(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
      return { required: true };
    }
    return null;
  }

  static minLength(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const value = String(control.value);
      if (value.length < min) {
        return { minlength: { requiredLength: min, actualLength: value.length } };
      }
      return null;
    };
  }

  static maxLength(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const value = String(control.value);
      if (value.length > max) {
        return { maxlength: { requiredLength: max, actualLength: value.length } };
      }
      return null;
    };
  }

  static email(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(control.value)) {
      return { email: true };
    }
    return null;
  }

  static pattern(pattern: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      if (!pattern.test(control.value)) {
        return { pattern: { requiredPattern: pattern.toString(), actualValue: control.value } };
      }
      return null;
    };
  }

  static number(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const num = Number(control.value);
    if (isNaN(num)) {
      return { number: true };
    }
    return null;
  }

  static min(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const num = Number(control.value);
      if (isNaN(num) || num < min) {
        return { min: { min, actual: num } };
      }
      return null;
    };
  }

  static max(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const num = Number(control.value);
      if (isNaN(num) || num > max) {
        return { max: { max, actual: num } };
      }
      return null;
    };
  }

  static porcentaje(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const value = String(control.value).replace('%', '').replace(',', '.');
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 100) {
      return { porcentaje: true };
    }
    return null;
  }

  static codigoCPP(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const codigoRegex = /^\d{6}$/;
    if (!codigoRegex.test(String(control.value).trim())) {
      return { codigoCPP: true };
    }
    return null;
  }
}

