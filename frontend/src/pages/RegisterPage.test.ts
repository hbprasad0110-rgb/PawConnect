import { describe, expect, it } from 'vitest';
import { validateRegistration, type RegistrationForm } from './RegisterPage';

const validForm: RegistrationForm = {
  name: 'Sam Taylor',
  email: 'sam@example.com',
  password: 'Password123!',
  confirmPassword: 'Password123!',
  phone: '5551234567',
  address: '123 Main Street',
};

describe('registration validation', () => {
  it('accepts a complete valid registration', () => {
    expect(validateRegistration(validForm)).toEqual({});
  });

  it('matches the API minimum lengths for phone and address', () => {
    expect(validateRegistration({ ...validForm, phone: '1', address: '2' })).toMatchObject({
      phone: 'Phone number must be at least 7 characters.',
      address: 'Address must be at least 5 characters.',
    });
  });

  it('validates email, password length, and password confirmation', () => {
    expect(validateRegistration({
      ...validForm,
      email: 'invalid',
      password: 'short',
      confirmPassword: 'different',
    })).toMatchObject({
      email: 'Enter a valid email address.',
      password: 'Password must be at least 8 characters.',
      confirmPassword: 'Passwords do not match.',
    });
  });
});
