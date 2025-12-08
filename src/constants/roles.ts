export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  PARENT: "parent",
  ADMIN: "admin",
  GUEST: "guest"
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Map roles to their home route
export const ROLE_HOME_URL = {
  [ROLES.STUDENT]: "/student",
  [ROLES.TEACHER]: "/teacher",
  [ROLES.PARENT]: "/parent",
  [ROLES.ADMIN]: "/admin/users",
  [ROLES.GUEST]: "/student"
};
