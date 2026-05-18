import { Component, inject, ChangeDetectorRef } from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Invoices } from '../../services/invoices';

@Component({
  selector: 'app-invoice-create',
  imports: [ReactiveFormsModule],
  templateUrl: './invoice-create.html',
  styleUrl: './invoice-create.scss',
})
export class InvoiceCreate {

  private fb = inject(FormBuilder);
  private invoicesService = inject(Invoices);
  private cdr = inject(ChangeDetectorRef);
  message: string = '';

  invoiceForm = this.fb.nonNullable.group({
    clientName: ['', [Validators.required]],
    total: [0, [Validators.required, Validators.min(0.01)]]
  });

  onSubmit() {

    this.message = '';
    if (this.invoiceForm.invalid)
    {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    this.invoicesService
      .createInvoice(this.invoiceForm.getRawValue())
      .subscribe({
        next: response => {
          console.log('INVOICE CREATED', response);
          this.message = "Invoice has been created.";
          this.cdr.detectChanges(); 
        },

        error: error => {
          console.error(error);
          this.message = "An error has occurred. Invoice has not been added.";
          this.cdr.detectChanges(); 
        }
      });
  }
}