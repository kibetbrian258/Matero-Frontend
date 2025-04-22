import { Injectable } from '@angular/core';

export interface RegistrationFormState {
  fullName?: string | null;
  email?: string | null;
  dateOfBirth?: string | Date | null;
  phoneNumber?: string | null;
  address?: string | null;
  termsAccepted?: boolean | null;
}

@Injectable({
  providedIn: 'root',
})
export class RegistrationFormService {
  private formState: RegistrationFormState = {};

  saveFormState(state: any): void {
    this.formState = { ...state };
  }

  getFormState(): RegistrationFormState {
    return this.formState;
  }

  clearFormState(): void {
    this.formState = {};
  }
}
