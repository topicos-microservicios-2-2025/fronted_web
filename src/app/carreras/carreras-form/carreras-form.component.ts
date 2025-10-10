import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarrerasService } from '../carreras.service';
import { Carrera } from '../carrera.model';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-carreras-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './carreras-form.component.html',
  styleUrls: ['./carreras-form.component.css']
})
export class CarrerasFormComponent {
  form;
  id?: number;

  constructor(
    private fb: FormBuilder,
    private carrerasService: CarrerasService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      sigla: ['', Validators.required],
      facultadId: ['', Validators.required]
    });
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.id = +idParam;
        this.carrerasService.getCarrera(this.id).subscribe(carrera => {
          this.form.patchValue({
            ...carrera,
            facultadId: carrera.facultadId.toString()
          });
        });
      }
    });
  }

  guardar() {
    if (this.form.invalid) return;
    const data = {
      nombre: this.form.value.nombre || '',
      descripcion: this.form.value.descripcion || '',
      sigla: this.form.value.sigla || '',
      facultadId: this.form.value.facultadId ? +this.form.value.facultadId : 0
    };
    if (this.id) {
      this.carrerasService.actualizarCarrera(this.id, data).subscribe({
        next: () => this.router.navigate(['/carreras']),
        error: () => alert('Error al actualizar carrera')
      });
    } else {
      this.carrerasService.crearCarrera(data).subscribe({
        next: () => this.router.navigate(['/carreras']),
        error: () => alert('Error al crear carrera')
      });
    }
  }
  cancelar() {
  this.router.navigate(['/carreras']);
}

}
