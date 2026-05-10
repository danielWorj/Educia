import { Routes } from '@angular/router';
import { authGuard } from './Core/Guards/AuthGuard';


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
  },
  // Authentication routes
   { 
     path: 'login', 
     loadComponent: () => import('./Features/Authentication/login/login').then(m => m.Login) 
   }, 
   {
    path : 'portail', 
    canActivate: [authGuard],
    children:[
      {
          path: 'dasboard',
          loadComponent: () => import('./Features/site/Portail/layout-portail/layout-portail').then(m => m.LayoutPortail) 
      },
    ]
   }, 
 
 // Dashboard  routes 
   {
     path: 'admin',
     loadComponent: () => import('./Features/admin/Layout/admin-layout/admin-layout').then(m => m.AdminLayout),
     //canActivate: [authGuard],
     children: [
          { 
          path: 'dashboard', 
          loadComponent: () => import('./Features/admin/Super/gdashboard/gdashboard').then(m => m.GDashboard) 
          },
          { 
          path: 'enseignants', 
          loadComponent: () => import('./Features/admin/Super/genseignant/genseignant').then(m => m.Genseignant) 
          },
          { 
          path: 'parents', 
          loadComponent: () => import('./Features/admin/Super/gparent/gparent').then(m => m.GParent) 
          },
          { 
          path: 'offres', 
          loadComponent: () => import('./Features/admin/Super/goffre/goffre').then(m => m.GOffre) 
          },
          { 
          path: 'revenus', 
          loadComponent: () => import('./Features/admin/Super/grevenus/grevenus').then(m => m.GRevenus) 
          },
          { 
          path: 'supports', 
          loadComponent: () => import('./Features/admin/Super/gsupport/gsupport').then(m => m.GSupport) 
          },
          { 
          path: 'settings', 
          loadComponent: () => import('./Features/admin/Super/settings/settings').then(s => s.Settings) 
          }
     ]
   },
  // Dashboard Enseignant 
   {
     path: 'admin/enseignant',
     loadComponent: () => import('./Features/admin/Layout/admin-layout/admin-layout').then(m => m.AdminLayout),
     //canActivate: [authGuard],
     children: [
          { 
            path: 'support', 
            loadComponent: () => import('./Features/admin/Enseignant/g-esupport/g-esupport').then(m => m.GEsupport) 
          },
          
     ]
   }
 
];

