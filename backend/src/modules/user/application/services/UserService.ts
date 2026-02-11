import { injectable, inject } from "tsyringe";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { CreateUserDto, UpdateUserDto, UserResponseDto } from "../dtos/UserDtos";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { BadRequestError, NotFoundError } from "../../../../utils/errors";

@injectable()
export class UserService {
  constructor(
    @inject("IUserRepository") private userRepository: IUserRepository
  ) { }

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    // Check if mobile exists
    const mobileExists = await this.userRepository.existsByMobile(dto.mobile);
    if (mobileExists) {
      throw new BadRequestError("Mobile number already registered");
    }

    // Check if email exists if provided
    if (dto.email) {
      const emailExists = await this.userRepository.existsByEmail(dto.email);
      if (emailExists) {
        throw new BadRequestError("Email already registered");
      }
    }

    let hashedPassword = dto.password;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    const user = new User(
      uuidv4(),
      dto.name,
      dto.mobile,
      dto.role,
      dto.isActive !== undefined ? dto.isActive : true,
      dto.email,
      null,
      new Date(),
      new Date(),
      hashedPassword
    );

    const savedUser = await this.userRepository.save(user);
    return this.mapToDto(savedUser);
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (dto.mobile && dto.mobile !== user.mobile) {
      const mobileExists = await this.userRepository.existsByMobile(dto.mobile, id);
      if (mobileExists) {
        throw new BadRequestError("Mobile number already registered");
      }
      user.mobile = dto.mobile;
    }

    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.userRepository.existsByEmail(dto.email, id);
      if (emailExists) {
        throw new BadRequestError("Email already registered");
      }
      user.email = dto.email;
    }

    if (dto.name) user.name = dto.name;
    if (dto.role) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.userRepository.save(user);
    return this.mapToDto(updatedUser);
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return this.mapToDto(user);
  }

  async getAllUsers(filters: any, pagination: any): Promise<{ users: UserResponseDto[]; total: number }> {
    const { users, total } = await this.userRepository.findAll(filters, pagination);
    return {
      users: users.map(u => this.mapToDto(u)),
      total
    };
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    await this.userRepository.delete(id);
  }

  private mapToDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt!
    };
  }
}
