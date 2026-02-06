
import { Entity } from "../../../../shared/core/Entity";
import { Result } from "../../../../shared/core/Result";
import { Guard } from "../../../../shared/core/Guard";

export interface ClientProps {
  code: string;
  userId: string;
}

export class Client extends Entity<ClientProps> {
  get code(): string { return this.props.code; }
  get userId(): string { return this.props.userId; }

  private constructor(props: ClientProps, id?: string) {
    super(props, id);
  }

  public static create(props: ClientProps, id?: string): Result<Client> {
    const guardedProps = [
      { argument: props.code, argumentName: 'code' },
      { argument: props.userId, argumentName: 'userId' }
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);

    if (guardResult.isFailure) {
      return Result.fail<Client>(guardResult.getError());
    }

    return Result.ok<Client>(new Client(props, id));
  }
}
