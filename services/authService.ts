const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://35.254.103.33:8010';
console.log('[authService] API_URL:', API_URL);

export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Błąd logowania');
      }

      return data;
    } catch (error: any) {
      console.error('[authService] login error:', error, 'URL was:', `${API_URL}/auth/login`);
      throw new Error(error.message || 'Błąd połączenia z serwerem');
    }
  },

  async register(email: string, password: string, confirmPassword: string) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, confirm_password: confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Błąd rejestracji');
      }

      return data;
    } catch (error: any) {
      console.error('[authService] register error:', error, 'URL was:', `${API_URL}/auth/register`);
      throw new Error(error.message || 'Błąd połączenia z serwerem');
    }
  },
};
