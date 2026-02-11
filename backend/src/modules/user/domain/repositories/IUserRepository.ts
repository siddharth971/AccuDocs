import { User } from "../entities/User";

export interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByMobile(mobile: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?: any, pagination?: any): Promise<{ users: User[]; total: number }>;
  delete(id: string): Promise<void>;
  existsByMobile(mobile: string, excludeId?: string): Promise<boolean>;
  existsByEmail(email: string, excludeId?: string): Promise<boolean>;
}
