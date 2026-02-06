export interface CreateClientDTO {
  name: string;
  mobile: string;
  code: string;
}

export interface UpdateClientDTO {
  name?: string;
  mobile?: string;
  code?: string;
}

export interface ClientResponseDTO {
  id: string;
  code: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    isActive: boolean;
  };
  years?: { id: string, year: string, documentCount?: number }[];
  createdAt?: Date;
  updatedAt?: Date;
}
