
import { Otp } from "../entities/Otp";

export interface IOtpRepository {
  save(otp: Otp): Promise<void>;
  findByMobile(mobile: string): Promise<Otp | null>;
  deleteByMobile(mobile: string): Promise<void>;
}
