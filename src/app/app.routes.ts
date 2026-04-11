import { Routes } from '@angular/router';


export const routes: Routes = [
 

];

// site.routes.ts
export const SITE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./Features/site/Layout/site-layout/site-layout').then(m => m.SiteLayout),
    children: [
      { path: '', loadChildren: () => import('./Features/site/home/home').then(m => m.Home) },
      { path: 'acceuil', loadChildren: () => import('./Features/site/home/home').then(m => m.Home) },
      { path: 'enseignants', loadChildren: () => import('./Features/site/site-enseignants/site-enseignants').then(m => m.SiteEnseignants) },
      { path: 'offres', loadChildren: () => import('./Features/site/site-offres/site-offres').then(m => m.SiteOffres) },
      { path: 'tarifs', loadChildren: () => import('./Features/site/site-tarifs/site-tarifs').then(m => m.SiteTarifs) },
      { path: 'marketplace', loadChildren: () => import('./Features/site/site-makertplace/site-makertplace').then(m => m.SiteMakertplace) },
      { path: 'contact', loadChildren: () => import('./Features/site/site-contact/site-contact').then(m => m.SiteContact) },
    ]
  }
]