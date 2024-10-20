import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent {
  users$: Observable<any[]> | undefined;
  isAdmin$: Observable<boolean> | undefined;
  editingUser: any | null = null;
  editForm: FormGroup;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required]
    });

    this.isAdmin$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc(`usuarios/${user.uid}`).valueChanges().pipe(
            map((userData: any) => userData.rol === 'admin') // Check if user is admin
          );
        } else {
          return of(false); // Not logged in, so not admin
        }
      })
    );

    this.users$ = this.isAdmin$.pipe(
      switchMap(isAdmin => {
        if (isAdmin) {
          return this.afs.collection('usuarios').valueChanges();
        } else {
          return of([]); // Return empty array if not admin
        }
      })
    );
  }

  editUser(user: any) {
    this.editingUser = user;
    this.editForm.patchValue(user); // Pre-fill the form with user data
  }

  async updateUser() {
    if (this.editForm.valid && this.editingUser) {
      try {
        await this.afs.doc(`usuarios/${this.editingUser.usuariosRef}`).update(this.editForm.value);
        this.cancelEdit(); // Clear the form and close editing mode
      } catch (error) {
        console.error("Error updating user:", error);
        // Handle the error appropriately (e.g., display an error message)
      }
    }
  }

  cancelEdit() {
    this.editingUser = null;
    this.editForm.reset();
  }
}
