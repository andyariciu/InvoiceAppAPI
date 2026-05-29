import { Component, inject, OnInit, ChangeDetectorRef  } from '@angular/core';
import { Invoices } from '../../services/invoices';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../../core/services/auth';

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
  private authService = inject(Auth);
  private router = inject(Router);
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
        console.error('Error when loading the invoices:', err);
        this.loading = false;
        this.error = "Couldn't load invoices.";
        this.cdr.detectChanges();
      }
    });
  }

  onApplyFilters(): void {
    this.loadInvoices();
  }
onLogout(): void {
    this.authService.logout().subscribe({
      next: () => this.clearLocalSession(),
      error: () => this.clearLocalSession() // Chiar dacă serverul dă vreo eroare, curățăm oricum sesiunea locală
    });
  }

  private clearLocalSession(): void {
    localStorage.removeItem('token'); // Ștergem JWT-ul
    this.router.navigate(['/login']); // Îl trimitem la Login
  }
}
