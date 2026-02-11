
import { Entity } from "../../../../shared/core/Entity";
import { Result } from "../../../../shared/core/Result";
import { Guard } from "../../../../shared/core/Guard";

export interface ClientProps {
  code: string;
  name: string;
  userId: string;
  status: 'active' | 'inactive' | 'suspended';
  metadata?: any;
}

export class Client extends Entity<ClientProps> {
  get code(): string { return this.props.code; }
  get name(): string { return this.props.name; }
  get userId(): string { return this.props.userId; }
  get status(): string { return this.props.status; }
  get metadata(): any { return this.props.metadata; }

  private constructor(props: ClientProps, id?: string) {
    super(props, id);
  }

  public static create(props: ClientProps, id?: string): Result<Client> {
    const guardedProps = [
      { argument: props.code, argumentName: 'code' },
      { argument: props.name, argumentName: 'name' },
      { argument: props.userId, argumentName: 'userId' },
      { argument: props.status, argumentName: 'status' }
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);

    if (guardResult.isFailure) {
      return Result.fail<Client>(guardResult.getError());
    }

    return Result.ok<Client>(new Client(props, id));
  }
}
