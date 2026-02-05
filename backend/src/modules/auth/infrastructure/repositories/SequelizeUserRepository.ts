
import { injectable } from "tsyringe";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { UserMapper } from "../mappers/UserMapper";
import { User as UserModel } from "../../../../models/user.model";

@injectable()
export class SequelizeUserRepository implements IUserRepository {
  async findByMobile(mobile: string): Promise<User | null> {
    const dbUser = await UserModel.findOne({ where: { mobile } });
    if (!dbUser) return null;
    return UserMapper.toDomain(dbUser);
  }

  async findById(id: string): Promise<User | null> {
    const dbUser = await UserModel.findByPk(id);
    if (!dbUser) return null;
    return UserMapper.toDomain(dbUser);
  }

  async save(user: User): Promise<void> {
    const raw = UserMapper.toPersistence(user);
    const exists = await this.exists(user.mobile);

    if (exists) {
      await UserModel.update(raw, { where: { id: raw.id } });
    } else {
      await UserModel.create(raw);
    }
  }

  async exists(mobile: string): Promise<boolean> {
    const user = await UserModel.findOne({ where: { mobile } });
    return !!user;
  }
}
