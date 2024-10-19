import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  resultado!: string;
  username: string = '';
  password: string = '';

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

