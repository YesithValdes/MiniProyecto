import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-crud',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './crud.component.html',
  styleUrl: './crud.component.css'
})
export class CrudComponent {

  resultado!: string;
  constructor(){

  }

  formularioLogin = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    password: new FormControl('', [Validators.required, Validators.maxLength(250)])
  });

  submit() {
    if (this.formularioLogin.valid)
      this.resultado = "Todos los datos son válidos";
    else
      this.resultado = "Hay datos inválidos en el formulario";
  }

}   
