export interface CreateUserDto {
  name: string;
  mobile: string;
  role: 'admin' | 'client';
  email?: string;
  password?: string; // Optional for admin creation of clients
  isActive?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  mobile?: string;
  role?: 'admin' | 'client';
  email?: string;
  password?: string;
  isActive?: boolean;
}

export interface UserResponseDto {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  role: string;
  isActive: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
}
