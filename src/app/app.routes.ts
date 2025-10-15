import { Routes } from '@angular/router';
import { EstudiantesComponent } from './estudiantes/estudiantes.component';
import { EstudianteFormComponent } from './estudiantes/estudiantes-form/estudiantes-form.component';  
import { InscripcionComponent } from './inscripcion/inscripcion.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'estudiantes', component: EstudiantesComponent, canActivate: [authGuard] },
  { path: 'estudiantes/nuevo', component: EstudianteFormComponent, canActivate: [authGuard] },
  {
    path: 'estudiantes/editar/:id',
    loadComponent: () =>
      import('./estudiantes/estudiantes-form/estudiantes-form.component').then(m => m.EstudianteFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'facultades',
    loadComponent: () => import('./facultades/facultades.component').then(m => m.FacultadesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'facultades/nuevo',
    loadComponent: () => import('./facultades/facultades-form/facultades-form.component').then(m => m.FacultadesFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'facultades/editar/:id',
    loadComponent: () => import('./facultades/facultades-form/facultades-form.component').then(m => m.FacultadesFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'carreras',
    loadComponent: () => import('./carreras/carreras.component').then(m => m.CarrerasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'carreras/nuevo',
    loadComponent: () => import('./carreras/carreras-form/carreras-form.component').then(m => m.CarrerasFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'carreras/editar/:id',
    loadComponent: () => import('./carreras/carreras-form/carreras-form.component').then(m => m.CarrerasFormComponent),
    canActivate: [authGuard]
  },

  {
    path: 'inscripcion',
    loadComponent: () => import('./inscripcion/inscripcion.component').then(m => m.InscripcionComponent),
    canActivate: [authGuard]
  }
];
