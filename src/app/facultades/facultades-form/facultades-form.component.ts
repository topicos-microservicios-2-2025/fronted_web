import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FacultadesService } from '../facultades.service';
import { Facultad } from '../facultad.model';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-facultades-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './facultades-form.component.html',
  styleUrls: ['./facultades-form.component.css']
})
export class FacultadesFormComponent {
  @Input() facultad?: Facultad;
  form;

  id?: number;
  constructor(
    private fb: FormBuilder,
    private facultadesService: FacultadesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      sigla: ['', Validators.required]
    });
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.id = +idParam;
        this.facultadesService.getFacultad(this.id).subscribe(facultad => {
          this.form.patchValue(facultad);
        });
      }
    });
  }

  guardar() {
    if (this.form.invalid) return;
    const data = {
      nombre: this.form.value.nombre || '',
      descripcion: this.form.value.descripcion || '',
      sigla: this.form.value.sigla || ''
    };
    if (this.id) {
      this.facultadesService.actualizarFacultad(this.id, data).subscribe({
        next: () => this.router.navigate(['/facultades']),
        error: () => alert('Error al actualizar facultad')
      });
    } else {
      this.facultadesService.crearFacultad(data).subscribe({
        next: () => this.router.navigate(['/facultades']),
        error: () => alert('Error al crear facultad')
      });
    }
  }
  cancelar() {
  this.router.navigate(['/facultades']);
}

}
