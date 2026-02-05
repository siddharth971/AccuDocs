
import { Entity } from "../../../../shared/core/Entity";
import { Result } from "../../../../shared/core/Result";
import { Guard } from "../../../../shared/core/Guard";

export interface UserProps {
  name: string;
  mobile: string;
  password?: string;
  role: 'admin' | 'client';
  isActive: boolean;
  lastLogin?: Date;
}

export class User extends Entity<UserProps> {
  get name(): string { return this.props.name; }
  get mobile(): string { return this.props.mobile; }
  get password(): string | undefined { return this.props.password; }
  get role(): string { return this.props.role; }
  get isActive(): boolean { return this.props.isActive; }
  get lastLogin(): Date | undefined { return this.props.lastLogin; }

  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  public static create(props: UserProps, id?: string): Result<User> {
    const guardedProps = [
      { argument: props.name, argumentName: 'name' },
      { argument: props.mobile, argumentName: 'mobile' },
      { argument: props.role, argumentName: 'role' }
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);

    if (guardResult.isFailure) {
      return Result.fail<User>(guardResult.getError());
    }

    return Result.ok<User>(new User(props, id));
  }
}
