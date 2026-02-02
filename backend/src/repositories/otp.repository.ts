import { OTP, OTPCreationAttributes } from '../models';
import { Op } from 'sequelize';
import { config } from '../config';

export const otpRepository = {
  async findByMobile(mobile: string): Promise<OTP | null> {
    return OTP.findOne({
      where: {
        mobile,
        expiresAt: { [Op.gt]: new Date() },
      },
      order: [['createdAt', 'desc']],
    });
  },

  async create(data: OTPCreationAttributes): Promise<OTP> {
    // Delete any existing OTPs for this mobile
    await this.deleteByMobile(data.mobile);
    return OTP.create(data);
  },

  async deleteByMobile(mobile: string): Promise<void> {
    await OTP.destroy({ where: { mobile } });
  },

  async incrementAttempts(id: string): Promise<number> {
    const otp = await OTP.findByPk(id);
    if (!otp) return 0;

    await otp.update({ attempts: otp.attempts + 1 });
    return otp.attempts + 1;
  },

  async isMaxAttemptsReached(mobile: string): Promise<boolean> {
    const otp = await this.findByMobile(mobile);
    if (!otp) return false;
    return otp.attempts >= config.otp.maxAttempts;
  },

  async cleanupExpired(): Promise<number> {
    const deleted = await OTP.destroy({
      where: {
        expiresAt: { [Op.lt]: new Date() },
      },
    });
    return deleted;
  },

  async getRecentCount(mobile: string, minutes: number = 60): Promise<number> {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    return OTP.count({
      where: {
        mobile,
        createdAt: { [Op.gt]: since },
      },
    });
  },
};
