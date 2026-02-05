
import { injectable } from "tsyringe";
import { IOtpRepository } from "../../domain/repositories/IOtpRepository";
import { Otp } from "../../domain/entities/Otp";
import { OTP as OtpModel } from "../../../../models/otp.model";

@injectable()
export class SequelizeOtpRepository implements IOtpRepository {
  async save(otp: Otp): Promise<void> {
    const raw = {
      mobile: otp.mobile,
      otpHash: otp.otpHash,
      expiresAt: otp.expiresAt,
      attempts: otp.attempts
    };

    // We don't have an ID in the domain entity usually until saved, 
    // but here we are using UUIDs generated in Domain/Entity base class?
    // The Entity base class generates a UUID.

    // Check if exists? Usually OTPs are just created.
    // But we might want to invalidate old ones?
    // For now, simple create.
    await OtpModel.create({
      ...raw,
      id: otp.id
    } as any);
  }

  async findByMobile(mobile: string): Promise<Otp | null> {
    const found = await OtpModel.findOne({
      where: { mobile },
      order: [['createdAt', 'DESC']]
    });

    if (!found) return null;

    const otpOrError = Otp.create({
      mobile: found.mobile,
      otpHash: found.otpHash,
      expiresAt: found.expiresAt,
      attempts: found.attempts
    }, found.id);

    return otpOrError.isSuccess ? otpOrError.getValue() : null;
  }

  async deleteByMobile(mobile: string): Promise<void> {
    await OtpModel.destroy({ where: { mobile } });
  }
}
