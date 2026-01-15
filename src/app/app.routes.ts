import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
  {
    path: 'image-to-base64',
    loadComponent: () => import('./image-to-base64/image-to-base64').then((m) => m.ImageToBase64),
  },
  {
    path: 'sha1',
    loadComponent: () => import('./sha1-converter/sha1-converter').then((m) => m.Sha1Converter),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
