const required = (name: string, value: string | undefined) => {
  if (!value) throw new Error(`Missing required frontend environment variable: ${name}`);
  return value;
};

export const appConfig = {
  apiBase: required('VITE_API_URL', import.meta.env.VITE_API_URL),
  animalPageSize: 50,
  demoAccounts: {
    adopter: {
      email: required('VITE_DEMO_ADOPTER_EMAIL', import.meta.env.VITE_DEMO_ADOPTER_EMAIL),
      password: required('VITE_DEMO_ADOPTER_PASSWORD', import.meta.env.VITE_DEMO_ADOPTER_PASSWORD),
    },
    admin: {
      email: required('VITE_DEMO_ADMIN_EMAIL', import.meta.env.VITE_DEMO_ADMIN_EMAIL),
      password: required('VITE_DEMO_ADMIN_PASSWORD', import.meta.env.VITE_DEMO_ADMIN_PASSWORD),
    },
  },
} as const;
