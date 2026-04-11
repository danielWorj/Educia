import { Routes } from '@angular/router';


export const routes: Routes = [
     // Site routes 
  {
    path: '',
    loadComponent: () => import('./Features/site/Layout/site-layout/site-layout').then(m => m.SiteLayout),
  children: [
     { 
     path: '', 
     loadComponent: () => import('./Features/site/home/home').then(m => m.Home) 
     },
     { 
     path: 'home', 
     loadComponent: () => import('./Features/site/home/home').then(m => m.Home) 
     },
     { 
     path: 'enseignants', 
     loadComponent: () => import('./Features/site/site-enseignants/site-enseignants').then(m => m.SiteEnseignants) 
     },
     { 
     path: 'offres', 
     loadComponent: () => import('./Features/site/site-offres/site-offres').then(m => m.SiteOffres) 
     },
     { 
     path: 'tarifs', 
     loadComponent: () => import('./Features/site/site-tarifs/site-tarifs').then(m => m.SiteTarifs) 
     },
     { 
     path: 'marketplace', 
     loadComponent: () => import('./Features/site/site-makertplace/site-makertplace').then(m => m.SiteMakertplace) 
     },
     { 
     path: 'contact', 
     loadComponent: () => import('./Features/site/site-contact/site-contact').then(m => m.SiteContact) 
     },
]
  }
 

];

