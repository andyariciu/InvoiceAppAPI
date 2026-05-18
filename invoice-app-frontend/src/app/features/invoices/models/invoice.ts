export interface Invoice {
  id: number;
  number: string;
  clientName: string;
  total: number;
  createdAt: string;
  userId: number;
}