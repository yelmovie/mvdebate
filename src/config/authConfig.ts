/**
 * Auth Configuration & Constants
 * Defines role types, protected paths, and other auth-related settings.
 */

export const USER_ROLES = {
  TEACHER: "teacher",
  STUDENT: "student",
  GUEST: "guest",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Protected Routes Configuration
// Key: URL Path Prefix, Value: Array of allowed roles
export const PROTECTED_PATHS: Record<string, UserRole[]> = {
  "/teacher": [USER_ROLES.TEACHER],
  "/student": [USER_ROLES.STUDENT, USER_ROLES.TEACHER], // Teachers can view student pages for debug/demo
  "/debate": [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.GUEST], // Guests can see debate but might be limited
};

// Public Routes (Accessible by everyone, including unauthenticated users)
export const PUBLIC_PATHS = [
  "/", 
  "/login", 
  "/signup", 
  "/about",
  "/api/auth" // API routes might need their own protection logic
];

export const LOGIN_REDIRECT_PATH = "/login";
export const HOME_PATH = "/";
