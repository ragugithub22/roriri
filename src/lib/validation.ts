import { toast } from "sonner";

// Validation rules
export const validationRules = {
  required: (value: string | null | undefined, fieldName: string): string | null => {
    if (!value || value.toString().trim() === "") {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value: string | null | undefined, fieldName: string = "Email"): string | null => {
    if (!value || value.trim() === "") return null; // Skip if empty (use required for mandatory)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return `${fieldName} must be a valid email address`;
    }
    return null;
  },

  phone: (value: string | null | undefined, fieldName: string = "Phone"): string | null => {
    if (!value || value.trim() === "") return null;
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(value.replace(/\D/g, ""))) {
      return `${fieldName} must be a valid phone number (10-15 digits)`;
    }
    return null;
  },

  minLength: (value: string | null | undefined, min: number, fieldName: string): string | null => {
    if (!value || value.trim() === "") return null;
    if (value.trim().length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (value: string | null | undefined, max: number, fieldName: string): string | null => {
    if (!value || value.trim() === "") return null;
    if (value.trim().length > max) {
      return `${fieldName} must be at most ${max} characters`;
    }
    return null;
  },

  positiveNumber: (value: string | number | null | undefined, fieldName: string): string | null => {
    if (value === null || value === undefined || value === "") return null;
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num) || num < 0) {
      return `${fieldName} must be a positive number`;
    }
    return null;
  },

  url: (value: string | null | undefined, fieldName: string = "URL"): string | null => {
    if (!value || value.trim() === "") return null;
    try {
      new URL(value);
      return null;
    } catch {
      return `${fieldName} must be a valid URL`;
    }
  },

  date: (value: string | null | undefined, fieldName: string = "Date"): string | null => {
    if (!value || value.trim() === "") return null;
    const dateObj = new Date(value);
    if (isNaN(dateObj.getTime())) {
      return `${fieldName} must be a valid date`;
    }
    return null;
  },

  password: (value: string | null | undefined, fieldName: string = "Password"): string | null => {
    if (!value || value.trim() === "") return null;
    if (value.length < 6) {
      return `${fieldName} must be at least 6 characters`;
    }
    return null;
  },

  alphanumeric: (value: string | null | undefined, fieldName: string): string | null => {
    if (!value || value.trim() === "") return null;
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(value.trim())) {
      return `${fieldName} must contain only letters and numbers`;
    }
    return null;
  },

  noSpecialChars: (value: string | null | undefined, fieldName: string): string | null => {
    if (!value || value.trim() === "") return null;
    const noSpecialRegex = /^[a-zA-Z0-9\s]+$/;
    if (!noSpecialRegex.test(value.trim())) {
      return `${fieldName} must not contain special characters`;
    }
    return null;
  },
};

// Field validation type
export interface FieldValidation {
  value: string | number | null | undefined;
  fieldName: string;
  rules: Array<
    | "required"
    | "email"
    | "phone"
    | "password"
    | "url"
    | "date"
    | "positiveNumber"
    | "alphanumeric"
    | "noSpecialChars"
    | { minLength: number }
    | { maxLength: number }
  >;
}

// Validate multiple fields and return all errors
export function validateFields(fields: FieldValidation[]): string[] {
  const errors: string[] = [];

  for (const field of fields) {
    const value = field.value?.toString() ?? "";

    for (const rule of field.rules) {
      let error: string | null = null;

      if (typeof rule === "string") {
        switch (rule) {
          case "required":
            error = validationRules.required(value, field.fieldName);
            break;
          case "email":
            error = validationRules.email(value, field.fieldName);
            break;
          case "phone":
            error = validationRules.phone(value, field.fieldName);
            break;
          case "password":
            error = validationRules.password(value, field.fieldName);
            break;
          case "url":
            error = validationRules.url(value, field.fieldName);
            break;
          case "date":
            error = validationRules.date(value, field.fieldName);
            break;
          case "positiveNumber":
            error = validationRules.positiveNumber(value, field.fieldName);
            break;
          case "alphanumeric":
            error = validationRules.alphanumeric(value, field.fieldName);
            break;
          case "noSpecialChars":
            error = validationRules.noSpecialChars(value, field.fieldName);
            break;
        }
      } else if ("minLength" in rule) {
        error = validationRules.minLength(value, rule.minLength, field.fieldName);
      } else if ("maxLength" in rule) {
        error = validationRules.maxLength(value, rule.maxLength, field.fieldName);
      }

      if (error) {
        errors.push(error);
        break; // Stop at first error for this field
      }
    }
  }

  return errors;
}

// Validate and show toast if errors exist
export function validateForm(fields: FieldValidation[]): boolean {
  const errors = validateFields(fields);

  if (errors.length > 0) {
    // Show first 3 errors max to avoid overwhelming the user
    const displayErrors = errors.slice(0, 3);
    const remaining = errors.length - 3;
    
    let message = displayErrors.join(". ");
    if (remaining > 0) {
      message += `. And ${remaining} more error${remaining > 1 ? "s" : ""}.`;
    }
    
    toast.error(message);
    return false;
  }

  return true;
}

// Helper to get trimmed string from FormData
export function getFormString(formData: FormData, key: string): string {
  const val = formData.get(key);
  if (typeof val !== "string") return "";
  return val.trim();
}

// Helper to get number from FormData
export function getFormNumber(formData: FormData, key: string): number | null {
  const val = formData.get(key);
  if (typeof val !== "string" || val.trim() === "") return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
}

// Helper to get integer from FormData
export function getFormInt(formData: FormData, key: string): number | null {
  const val = formData.get(key);
  if (typeof val !== "string" || val.trim() === "") return null;
  const num = parseInt(val, 10);
  return isNaN(num) ? null : num;
}
