
import { Result } from "./Result";

export interface GuardArgumentCollection {
  argument: any;
  argumentName: string;
}

export class Guard {
  public static combine(guardResults: Result<any>[]): Result<any> {
    for (let result of guardResults) {
      if (result.isFailure) return result;
    }

    return Result.ok();
  }

  public static againstNullOrUndefined(argument: any, argumentName: string): Result<any> {
    if (argument === null || argument === undefined) {
      return Result.fail<any>(`${argumentName} is null or undefined`);
    } else {
      return Result.ok<any>();
    }
  }

  public static againstNullOrUndefinedBulk(args: GuardArgumentCollection[]): Result<any> {
    for (let arg of args) {
      const result = this.againstNullOrUndefined(arg.argument, arg.argumentName);
      if (result.isFailure) return result;
    }

    return Result.ok<any>();
  }

  public static isOneOf(value: any, validValues: any[], argumentName: string): Result<any> {
    let isValid = false;
    for (let validValue of validValues) {
      if (value === validValue) {
        isValid = true;
      }
    }

    if (isValid) {
      return Result.ok<any>();
    } else {
      return Result.fail<any>(`${argumentName} isn't oneOf the correct types in ${JSON.stringify(validValues)}. Got "${value}".`);
    }
  }

  public static inRange(num: number, min: number, max: number, argumentName: string): Result<any> {
    const isInRange = num >= min && num <= max;
    if (!isInRange) {
      return Result.fail<any>(`${argumentName} is not within range ${min} to ${max}.`);
    } else {
      return Result.ok<any>();
    }
  }

  public static allInRange(numbers: number[], min: number, max: number, argumentName: string): Result<any> {
    let failingResult: Result<any> | null = null;
    for (let num of numbers) {
      const numIsInRangeResult = this.inRange(num, min, max, argumentName);
      if (!numIsInRangeResult.isFailure) failingResult = numIsInRangeResult;
    }

    if (failingResult) {
      return Result.fail<any>(`${argumentName} is not within the range.`);
    } else {
      return Result.ok<any>();
    }
  }
}
