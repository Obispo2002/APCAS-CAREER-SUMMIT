import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'username is required'),
  password: z.string().min(1, 'Password is required').max(32, 'Password is too long')
});

export const registerSchema = loginSchema;

export const clusterSchema = z.object({
  cluster_name: z.string().min(1, 'Cluster name is required'),
  userName: z.string().optional(),
  hashed_password: z.string().min(6, 'Password must be at least 6 characters long')
});

export const updateClusterSchema = z.object({
  userId: z.any().optional(),
  cluster_name: z.string().min(1, 'Cluster name is required'),
  userName: z.string().optional(),
  hashed_password: z.string().optional()
});

export const counterSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  counter_name: z.string().min(1, 'Counter name is required'),
  company: z.string().min(1, 'Company is required')
});

export const counterSchemaClient = counterSchema.omit({ user_id: true });

export const updateCounterSchema = z.object({
  id: z.string().min(1, 'Counter ID is required'),
  counter_name: z.string().min(1, 'Counter name is required'),
  company: z.string().min(1, 'Company is required')
});

export const userSchema = z.object({
  role: z.enum(['user'], { errorMap: () => ({ message: 'Invalid role selection' }) })
});

export const reportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle type is required'),
  startDate: z.any(),
  endDate: z.any(),
  preparedBy: z.string().min(1, 'Prepared by is required'),
  notedBy: z.string().min(1, 'Noted by is required'),
  eventType: z.string().min(1, 'Event type is required'),
  positionPrepared: z.string().min(1, 'Postion prepared by is required'),
  positionNoted: z.string().min(1, 'Position noted by is required')
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(32, 'Password is too long'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').max(32, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Confirm password is required').max(32, 'Password is too long')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export type changePasswordSchema = z.infer<typeof changePasswordSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type clusterSchema = z.infer<typeof clusterSchema>;
export type counterSchema = z.infer<typeof counterSchema>;
export type counterSchemaClient = z.infer<typeof counterSchemaClient>;
export type updateCounterSchema = z.infer<typeof updateCounterSchema>;
export type userSchema = z.infer<typeof userSchema>;
export type updateClusterSchema = z.infer<typeof updateClusterSchema>;