import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Invoice } from '../models/invoice';
import { CreateInvoiceDto } from '../models/create-invoice.dto';

@Injectable({
  providedIn: 'root'
})
export class Invoices {

  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7195/api/Invoices';

getInvoices(search?: string, minTotal?: number): Observable<any[]> {
    let params = new HttpParams();

    if (search) {
      params = params.set('search', search);
    }
    if (minTotal !== undefined && minTotal !== null) {
      params = params.set('minTotal', minTotal.toString());
    }

    return this.http.get<any[]>(this.apiUrl, { params });
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

  uploadInvoices(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload-invoices`, formData);
  }

}