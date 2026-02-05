
import { Result } from "./Result";

export namespace AppError {
  export class UnexpectedError extends Result<any> {
    public constructor(err: any) {
      super(false, {
        message: `An unexpected error occurred.`,
        error: err
      } as any);
      console.log(`[AppError]: An unexpected error occurred`);
      console.error(err);
    }

    public static create(err: any): UnexpectedError {
      return new UnexpectedError(err);
    }
  }
}
