export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const AUTH_ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  STUDENT_HOME: '/student',
  TEACHER_DASHBOARD: '/teacher',
} as const;
