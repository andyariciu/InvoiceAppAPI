import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Invoice } from '../models/invoice';
import { CreateInvoiceDto } from '../models/create-invoice.dto';

@Injectable({
  providedIn: 'root'
})
export class Invoices {

  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7195/api/Invoices';

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getInvoiceById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  createInvoice(dto: CreateInvoiceDto) {
    return this.http.post(this.apiUrl, dto);
  }

  deleteInvoice(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateInvoice(id: number, dto: any) {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }
}