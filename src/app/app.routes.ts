import { Routes } from '@angular/router';
import { EstudiantesComponent } from './estudiantes/estudiantes.component';
import { EstudianteFormComponent } from './estudiantes/estudiantes-form/estudiantes-form.component';
import { InscripcionComponent } from './inscripcion/inscripcion.component';


export const routes: Routes = [
  { path: '', redirectTo: 'estudiantes', pathMatch: 'full' },
  { path: 'estudiantes', component: EstudiantesComponent },
  { path: 'estudiantes/nuevo', component: EstudianteFormComponent },
  {
    path: 'estudiantes/editar/:id',
    loadComponent: () =>
      import('./estudiantes/estudiantes-form/estudiantes-form.component').then(m => m.EstudianteFormComponent)
  },
  {
    path: 'facultades',
    loadComponent: () => import('./facultades/facultades.component').then(m => m.FacultadesComponent)
  },
  {
    path: 'facultades/nuevo',
    loadComponent: () => import('./facultades/facultades-form/facultades-form.component').then(m => m.FacultadesFormComponent)
  },
  {
    path: 'facultades/editar/:id',
    loadComponent: () => import('./facultades/facultades-form/facultades-form.component').then(m => m.FacultadesFormComponent)
  },
  {
    path: 'carreras',
    loadComponent: () => import('./carreras/carreras.component').then(m => m.CarrerasComponent)
  },
  {
    path: 'carreras/nuevo',
    loadComponent: () => import('./carreras/carreras-form/carreras-form.component').then(m => m.CarrerasFormComponent)
  },
  {
    path: 'carreras/editar/:id',
    loadComponent: () => import('./carreras/carreras-form/carreras-form.component').then(m => m.CarrerasFormComponent)
  },

  {
    path: 'inscripcion',
    loadComponent: () => import('./inscripcion/inscripcion.component').then(m => m.InscripcionComponent)
  }
];
