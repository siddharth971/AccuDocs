
import { Entity } from "../../../../shared/core/Entity";
import { Result } from "../../../../shared/core/Result";
import { Guard } from "../../../../shared/core/Guard";

export interface OtpProps {
  mobile: string;
  otpHash: string;
  expiresAt: Date;
  attempts?: number;
}

export class Otp extends Entity<OtpProps> {
  get mobile(): string { return this.props.mobile; }
  get otpHash(): string { return this.props.otpHash; }
  get expiresAt(): Date { return this.props.expiresAt; }
  get attempts(): number { return this.props.attempts || 0; }

  private constructor(props: OtpProps, id?: string) {
    super(props, id);
  }

  public static create(props: OtpProps, id?: string): Result<Otp> {
    const guardedProps = [
      { argument: props.mobile, argumentName: 'mobile' },
      { argument: props.otpHash, argumentName: 'otpHash' },
      { argument: props.expiresAt, argumentName: 'expiresAt' }
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);

    if (guardResult.isFailure) {
      return Result.fail<Otp>(guardResult.getError());
    }

    return Result.ok<Otp>(new Otp(props, id));
  }

  public isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }
}
