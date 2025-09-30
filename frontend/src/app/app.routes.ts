import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register').then(m => m.RegisterComponent) },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'policies', 
    loadComponent: () => import('./pages/policies/policy-list/policy-list').then(m => m.PolicyListComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'user/policies', 
    loadComponent: () => import('./pages/policies/my-policies/my-policies').then(m => m.MyPoliciesComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'policies/:id', 
    loadComponent: () => import('./pages/policies/policy-detail/policy-detail').then(m => m.PolicyDetailComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'claims', 
    loadComponent: () => import('./pages/claims/claim-list/claim-list').then(m => m.ClaimListComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'payments', 
    loadComponent: () => import('./pages/payments/payment-list/payment-list').then(m => m.PaymentListComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard(['admin'])]
  },
  {
    path: 'admin/claims',
    loadComponent: () => import('./pages/admin/admin-claims/admin-claims').then(m => m.AdminClaimsPage),
    canActivate: [authGuard, roleGuard(['admin'])]
  },
  {
    path: 'admin/agents',
    loadComponent: () => import('./pages/admin/admin-agents/admin-agents').then(m => m.AdminAgentsPage),
    canActivate: [authGuard, roleGuard(['admin'])]
  },
  {
    path: 'admin/audit',
    loadComponent: () => import('./pages/admin/admin-audit/admin-audit').then(m => m.AdminAuditPage),
    canActivate: [authGuard, roleGuard(['admin'])]
  },
  {
    path: 'admin/summary',
    loadComponent: () => import('./pages/admin/admin-summary/admin-summary').then(m => m.AdminSummaryPage),
    canActivate: [authGuard, roleGuard(['admin'])]
  },
  { path: '**', redirectTo: '/home' }
];
