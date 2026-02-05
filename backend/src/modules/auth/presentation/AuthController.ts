
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { SendOtpUseCase } from '../application/useCases/SendOtpUseCase';

export class AuthController {

  static async sendOtp(req: Request, res: Response) {
    const useCase = container.resolve(SendOtpUseCase);

    const { mobile } = req.body;

    const result = await useCase.execute({ mobile });

    if (result.isFailure) {
      return res.status(400).json({
        success: false,
        message: result.getError()
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP Sent successfully"
    });
  }
}
