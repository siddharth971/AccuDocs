
import { container } from "tsyringe";
import { SequelizeUserRepository } from "../modules/user/infrastructure/repositories/SequelizeUserRepository";
import { SequelizeOtpRepository } from "../modules/auth/infrastructure/repositories/SequelizeOtpRepository";
import { WhatsAppServiceAdapter } from "../modules/notification/infrastructure/WhatsAppServiceAdapter";

// Register Repositories
container.register("IUserRepository", {
  useClass: SequelizeUserRepository
});

container.register("IOtpRepository", {
  useClass: SequelizeOtpRepository
});

// Register Services
container.register("INotificationService", {
  useClass: WhatsAppServiceAdapter
});

export { container };
