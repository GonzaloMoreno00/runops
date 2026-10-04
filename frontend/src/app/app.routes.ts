import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './auth/pages/login/login';
import { Register } from './auth/pages/register/register';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'dashboard',
    component: Dashboard
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  }
];
