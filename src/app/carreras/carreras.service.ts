import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Carrera } from './carrera.model';

@Injectable({ providedIn: 'root' })
export class CarrerasService {
  private apiUrl = 'http://localhost:3000/carreras';

  constructor(private http: HttpClient) {}

  getCarreras(): Observable<Carrera[]> {
    return this.http.get<Carrera[]>(this.apiUrl);
  }

  getCarrera(id: number): Observable<Carrera> {
    return this.http.get<Carrera>(`${this.apiUrl}/${id}`);
  }

  crearCarrera(carrera: Partial<Carrera>): Observable<Carrera> {
    return this.http.post<Carrera>(this.apiUrl, carrera);
  }

  actualizarCarrera(id: number, carrera: Partial<Carrera>): Observable<Carrera> {
    return this.http.put<Carrera>(`${this.apiUrl}/${id}`, carrera);
  }

  eliminarCarrera(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
