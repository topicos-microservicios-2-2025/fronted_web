import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Facultad } from './facultad.model';

@Injectable({ providedIn: 'root' })
export class FacultadesService {
  private apiUrl = 'http://localhost:3000/facultades';

  constructor(private http: HttpClient) {}

  getFacultades(): Observable<Facultad[]> {
    return this.http.get<Facultad[]>(this.apiUrl);
  }

  getFacultad(id: number): Observable<Facultad> {
    return this.http.get<Facultad>(`${this.apiUrl}/${id}`);
  }

  crearFacultad(facultad: Partial<Facultad>): Observable<Facultad> {
    return this.http.post<Facultad>(this.apiUrl, facultad);
  }

  actualizarFacultad(id: number, facultad: Partial<Facultad>): Observable<Facultad> {
    return this.http.put<Facultad>(`${this.apiUrl}/${id}`, facultad);
  }

  eliminarFacultad(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
