import { IClientRepository } from "../domain/interfaces/client_repository.interface";
import { IClient } from "../domain/interfaces/client.interface";
import { ClientNotFound } from "../domain/exceptions/client_not_found";

export class FindByClientId {
  constructor(private readonly clientRepository: IClientRepository) {}

  async run(clientId: string): Promise<IClient> {
    const client: IClient =
      await this.clientRepository.findByClientId(clientId);

    if (!client) {
      throw new ClientNotFound();
    }

    return client;
  }
}
