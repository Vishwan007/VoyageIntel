import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignupData {
  email: string;
  password: string;
  name?: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export async function signup(data: SignupData): Promise<{ message: string }> {
  try {
    return await apiRequest("/api/auth/signup", {
      method: "POST",
      data,
    });
  } catch (error: any) {
    // Extract error message from the response if available
    const errorMessage = error?.message || "Failed to sign up";
    throw new Error(errorMessage);
  }
}

export async function signin(data: SigninData): Promise<AuthResponse> {
  try {
    return await apiRequest("/api/auth/signin", {
      method: "POST",
      data,
    });
  } catch (error: any) {
    // Extract error message from the response if available
    const errorMessage = error?.message || "Failed to sign in";
    throw new Error(errorMessage);
  }
}

// Store auth token in localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

// Get auth token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

// Remove auth token from localStorage
export function removeAuthToken(): void {
  localStorage.removeItem("auth_token");
}

// Store user in localStorage
export function setUser(user: User): void {
  localStorage.setItem("user", JSON.stringify(user));
}

// Get user from localStorage
export function getUser(): User | null {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    return null;
  }
}

// Remove user from localStorage
export function removeUser(): void {
  localStorage.removeItem("user");
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Logout user
export function logout(): void {
  removeAuthToken();
  removeUser();
}