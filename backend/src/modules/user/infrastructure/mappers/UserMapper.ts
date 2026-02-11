import { User } from "../../domain/entities/User";
import { User as UserModel } from "../../../../models/user.model";

export class UserMapper {
  public static toDomain(raw: UserModel): User {
    return new User(
      raw.id,
      raw.name,
      raw.mobile,
      raw.role as 'admin' | 'client',
      raw.isActive,
      raw.email,
      raw.lastLogin,
      raw.createdAt,
      raw.updatedAt,
      raw.password
    );
  }

  public static toPersistence(user: User): any {
    return {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      is_active: user.isActive,
      email: user.email,
      last_login: user.lastLogin,
      password: user.password
    };
  }
}
