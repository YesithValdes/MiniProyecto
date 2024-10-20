import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [AngularFireAuth]
})
export class LoginComponent {
  resultado!: string;
  error: string = '';
  

  constructor(private router: Router, private auth: AngularFireAuth) {}

  formularioLogin = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    password: new FormControl('', [Validators.required, Validators.maxLength(250)])
  });

  async login() {
    if (this.formularioLogin.valid) {
      const username = this.formularioLogin.get('username')?.value ?? '';
      const password = this.formularioLogin.get('password')?.value ?? '';

      try {
        await this.auth.signInWithEmailAndPassword(username, password);
        this.router.navigate(['/dashboard']);
      } catch (err) {
        this.error;
      }
    } else {
      // ...
    }
  }
}
