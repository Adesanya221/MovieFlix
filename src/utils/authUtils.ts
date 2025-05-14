// This file simulates authentication functionality without actually storing data

// Check if user is logged in (using localStorage for demo purposes)
export const isUserLoggedIn = (): boolean => {
  return localStorage.getItem('movieflix_user') !== null;
};

// Login user (demo only)
export const loginUser = (email: string): void => {
  // In a real app, we would make an API call here
  localStorage.setItem('movieflix_user', JSON.stringify({ email, isLoggedIn: true }));
};

// Logout user
export const logoutUser = (): void => {
  localStorage.removeItem('movieflix_user');
};

// Sign up user (demo only)
export const signupUser = (email: string): void => {
  // In a real app, we would make an API call here
  localStorage.setItem('movieflix_user', JSON.stringify({ email, isLoggedIn: true }));
};

// Get user info
export const getUserInfo = (): { email: string } | null => {
  const user = localStorage.getItem('movieflix_user');
  if (!user) return null;
  
  try {
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
}; 