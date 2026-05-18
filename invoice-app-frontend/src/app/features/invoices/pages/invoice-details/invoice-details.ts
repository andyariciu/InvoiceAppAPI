import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { Invoices } from '../../services/invoices';


@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [],
  templateUrl: './invoice-details.html',
  styleUrl: './invoice-details.scss'
})
export class InvoiceDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private invoicesService = inject(Invoices);
  private cdr = inject(ChangeDetectorRef);
  invoice: any = null;
  error: string | null = null;
  loading = true;

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.invoicesService
      .getInvoiceById(id)
      .subscribe({
        next: response => {

          this.invoice = response;
          this.loading = false;
          console.log(response);
          this.cdr.detectChanges(); 
        },

        error: error => {
          console.error(error);
          this.loading = false;
          this.error = "Invoice not found or access denied.";
          this.cdr.detectChanges(); 
        }
      });
  }
}