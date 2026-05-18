import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { Login } from './auth/login/login';
import { InvoiceList } from './features/invoices/pages/invoice-list/invoice-list';
import { InvoiceEdit } from './features/invoices/pages/invoice-edit/invoice-edit';
import { InvoiceDetails } from './features/invoices/pages/invoice-details/invoice-details';
import { InvoiceCreate } from './features/invoices/pages/invoice-create/invoice-create';
import { authGuard } from './core/guards/auth-guard';


export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'invoices', canActivate: [authGuard],
      children:[
        { path: '', component: InvoiceList },
        { path: 'create', component: InvoiceCreate },
        { path: 'edit/:id', component: InvoiceEdit },
        { path: 'details/:id', component: InvoiceDetails }
      ]
    }
];
