const API_URL = 'http://10.0.2.2:8000'; // Ustaw adres lokalny swojego backendu

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
      throw new Error(error.message || 'Błąd połączenia z serwerem');
    }
  },
};
