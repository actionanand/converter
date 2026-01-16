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
    path: 'jwt',
    loadComponent: () => import('./jwt-decoder/jwt-decoder').then((m) => m.JwtDecoder),
  },
  {
    path: 'color-picker',
    loadComponent: () => import('./color-picker/color-picker').then((m) => m.ColorPicker),
  },
  {
    path: 'text-compare',
    loadComponent: () => import('./text-compare/text-compare').then((m) => m.TextCompare),
  },
  {
    path: 'json-formatter',
    loadComponent: () => import('./json-formatter/json-formatter').then((m) => m.JsonFormatter),
  },
  {
    path: 'word-counter',
    loadComponent: () => import('./word-counter/word-counter').then((m) => m.WordCounter),
  },
  {
    path: 'lorem-ipsum',
    loadComponent: () => import('./lorem-ipsum/lorem-ipsum').then((m) => m.LoremIpsum),
  },
  {
    path: 'unit-converter',
    loadComponent: () => import('./unit-converter/unit-converter').then((m) => m.UnitConverter),
  },
  {
    path: 'cipher',
    loadComponent: () => import('./cipher/cipher').then((m) => m.Cipher),
  },
  {
    path: 'pc77',
    loadComponent: () => import('./pc77/pc77').then((m) => m.Pc77Converter),
  },
  {
    path: 'base-converter',
    loadComponent: () => import('./base-converter/base-converter').then((m) => m.BaseConverter),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
