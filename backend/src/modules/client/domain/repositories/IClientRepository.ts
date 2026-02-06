import { Client } from "../entities/Client";

export interface IClientRepository {
  save(client: Client, options?: any): Promise<void>;
  findById(id: string): Promise<Client | null>;
  findByCode(code: string): Promise<Client | null>;
  findByUserId(userId: string): Promise<Client | null>;
  existsByCode(code: string, excludeId?: string): Promise<boolean>;
  getNextCode(): Promise<string>;
  delete(id: string, options?: any): Promise<void>;
  findAll(filters: any, pagination: any): Promise<{ clients: any[]; total: number }>;
}
