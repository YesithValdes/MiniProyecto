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

  // Function to check the number of admin users
  async checkAdminCount(): Promise<boolean> {
    try {
      const adminSnapshot = await this.afs.collection('usuarios', ref => ref.where('rol', '==', 'admin')).get().toPromise();

      if (!adminSnapshot) {
        this.errorMessage = "Error al obtener la información de administradores."; // Handle the case where adminSnapshot is undefined
        return false; // Prevent registration
      }

      const adminCount = adminSnapshot.size; // Use .size to get the number of admins

      if (adminCount >= 2) {
        this.errorMessage = "Ya existen dos administradores. No se pueden registrar más."; // Set error message
        return false; // Return false to prevent registration
      }
      return true; // Allow registration if less than two admins

    } catch (error) {
      console.error("Error fetching admin count:", error); // Log any potential errors
      this.errorMessage = "Error al verificar la cantidad de administradores.";
      return false; // Prevent registration in case of error
    }
  }

  async register() {
    if (this.registerForm.valid && this.selectedFile) {
      const { correo, password, nombre, tipoDocumento, numeroDocumento, genero, telefono, rol, fechaNacimiento } = this.registerForm.value;

      // Check if the role is 'admin' and if the limit of admins is reached
      if (rol === 'admin') {
        const canRegister = await this.checkAdminCount(); // Call the function to check admin count
        if (!canRegister) {
          return; // Stop the registration if there are already 2 admins
        }
      }

      const passwordcod = await this.hashPassword(password); 
      
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
                  passwordcod
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

  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

