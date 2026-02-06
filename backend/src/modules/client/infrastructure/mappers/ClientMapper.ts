import { Client } from "../../domain/entities/Client";
import { Client as ClientModel } from "../../../../models/client.model";

export class ClientMapper {
  public static toDomain(raw: ClientModel): Client {
    const clientOrError = Client.create({
      code: raw.code,
      userId: raw.userId,
    }, raw.id);

    if (clientOrError.isFailure) {
      console.error(clientOrError.getError());
      return null as any;
    }

    return clientOrError.getValue();
  }

  public static toPersistence(client: Client): any {
    return {
      id: client.id,
      code: client.code,
      userId: client.userId,
    };
  }
}
