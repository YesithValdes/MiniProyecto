import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule // Import ReactiveFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  providers: [AngularFireAuth, AngularFireStorage]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  selectedFile: File | null = null;
  uploadPercent: number = 0;
  downloadURL: Observable<string> | undefined;

  constructor(
    private fb: FormBuilder, 
    private afAuth: AngularFireAuth, 
    private storage: AngularFireStorage,
    private router: Router,
    private afs: AngularFirestore
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      password: ['', Validators.required],
      genero: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      rol: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      foto: [''] // You might want to make this required as well
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  async register() {
    if (this.registerForm.valid && this.selectedFile) {
      const { correo, password, nombre, tipoDocumento, numeroDocumento, genero, telefono, rol, fechaNacimiento } = this.registerForm.value;
  
      try {
        // 1. Create user with Firebase Authentication
        const userCredential = await this.afAuth.createUserWithEmailAndPassword(correo, password);
        const user = userCredential.user;
  
        // 2. Upload the image to Firebase Storage
        if (user) {
          const filePath = `perfiles/${user.uid}/${this.selectedFile.name}`;
          const fileRef = this.storage.ref(filePath);
          const task = this.storage.upload(filePath, this.selectedFile);
  
          // Observe percentage changes
          task.percentageChanges().subscribe(percentage => {
            this.uploadPercent = Math.round(percentage ? percentage : 0);
          });
  
          // Get download URL after upload
          task.snapshotChanges().pipe(
            finalize(async () => {
              this.downloadURL = fileRef.getDownloadURL();
              const fotoURL = await this.downloadURL.toPromise(); // Esperar a que la URL esté disponible
  
              if (fotoURL) {
                // 3. Update user profile with additional data and photo URL
                await user.updateProfile({
                  displayName: `${nombre}`,
                  photoURL: fotoURL // Store the download URL
                });
  
                // 4. Store additional user data in Firestore
                const userData = {
                  usuariosRef: user.uid, // Use 'usuariosRef' as the field name for the user's UID
                  nombre,
                  tipodocumento: tipoDocumento,
                  numerodocumento: numeroDocumento,
                  genero,
                  email: correo,
                  telefono,
                  rol,
                  fechanacimiento: fechaNacimiento,
                  foto: fotoURL,
                  password
                };

                console.log("Firestore Data:", userData);
  
                try {
                  await this.afs.collection('usuarios').doc(user.uid).set(userData);
                  console.log("Data saved to Firestore successfully!"); // Log success
                  this.router.navigate(['/login']);
                } catch (error) {
                  console.error("Error storing user data in Firestore:", error);
                }
              }
            })
          ).subscribe();
        }
      } catch (error: any) {
        console.error("Firebase Authentication Error:", error); // Log authentication errors
        this.errorMessage = error.message;
      }
    } else {
      console.warn("Form is invalid:", this.registerForm.errors); // Log form validation errors
      this.errorMessage = "Por favor, complete todos los campos del formulario.";
    }
  }
  
}
