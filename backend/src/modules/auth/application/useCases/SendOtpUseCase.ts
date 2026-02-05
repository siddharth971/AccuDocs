
import { injectable, inject } from "tsyringe";
import { IOtpRepository } from "../../domain/repositories/IOtpRepository";
import { INotificationService } from "../../../notification/domain/interfaces/INotificationService";
import { UseCase } from "../../../../shared/core/UseCase";
import { Result } from "../../../../shared/core/Result";
import { AppError } from "../../../../shared/core/AppError";
import { Otp } from "../../domain/entities/Otp";
import { generateOTP, hashOTP } from "../../../../utils/encryption";

interface Request {
  mobile: string;
}

@injectable()
export class SendOtpUseCase implements UseCase<Request, Promise<Result<void>>> {
  constructor(
    @inject("IOtpRepository") private otpRepo: IOtpRepository,
    @inject("INotificationService") private notificationService: INotificationService
  ) { }

  public async execute(req: Request): Promise<Result<void>> {
    try {
      const otpCode = generateOTP(6);
      const otpHash = await hashOTP(otpCode);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      const otpOrError = Otp.create({
        mobile: req.mobile,
        otpHash: otpHash,
        expiresAt: expiresAt
      });

      if (otpOrError.isFailure) {
        return Result.fail(otpOrError.getError());
      }

      const otp = otpOrError.getValue();
      await this.otpRepo.save(otp);

      await this.notificationService.sendWhatsAppMessage(req.mobile, `Your OTP is ${otpCode}`);

      return Result.ok<void>();
    } catch (err) {
      return AppError.UnexpectedError.create(err);
    }
  }
}
