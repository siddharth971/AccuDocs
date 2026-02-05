
import { User } from "../entities/User";

export interface IUserRepository {
  findByMobile(mobile: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  exists(mobile: string): Promise<boolean>;
}
