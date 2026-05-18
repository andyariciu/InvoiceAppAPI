import { Component, inject, OnInit, ChangeDetectorRef  } from '@angular/core';
import { Invoices } from '../../services/invoices';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [ RouterLink ],
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.scss',
})

export class InvoiceList implements OnInit {

  private invoicesService = inject(Invoices);
  private cdr = inject(ChangeDetectorRef);
  invoices: any[] = [];
  searchString: string = '';
  error: string | null = null;
  minTotalFilter: number | null = null;
  loading = true;

  ngOnInit(): void {
    //load all invoices when after page loads
    this.loadInvoices();
  }

  loadInvoices(): void {
  this.loading = true;
  this.cdr.detectChanges();
  this.invoicesService
    .getInvoices(this.searchString, this.minTotalFilter ?? undefined)
    .subscribe({
      next: (response) => {
        this.invoices = response;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Eroare la încărcarea facturilor:', err);
        this.loading = false;
        this.error = "Nu am putut încărca facturile de pe server.";
        this.cdr.detectChanges();
      }
    });
  }

  onApplyFilters(): void {
    this.loadInvoices();
  }

}
