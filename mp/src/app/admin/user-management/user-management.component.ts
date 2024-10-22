import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService } from '../../services/user.services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  imports: [CommonModule,FormsModule],
  standalone: true
})
export class UserManagementComponent implements OnInit {
  isAdmin$: Observable<boolean>;
  users$: Observable<any[]>;
  editingUser: any = null;
  editForm: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.isAdmin$ = this.userService.isAdmin(); // Assuming you have a method to check admin role
    this.users$ = this.userService.getUsers(); // Assuming you have a method to get all users
    this.editForm = this.fb.group({
      nombre: [''],
      email: [''],
      rol: [''],
      fechanacimiento: [''],
      genero: [''],
      tipodocumento: [''],
      numerodocumento: [''],
      telefono: ['']
    });
  }

  ngOnInit(): void {
    // Any additional initialization logic
  }

  editUser(user: any) {
    this.editingUser = user;
    this.editForm.patchValue(user);
  }

  updateUser() {
    if (this.editForm.valid && this.editingUser) {
      const updatedUser = { ...this.editingUser, ...this.editForm.value };
      this.userService.updateUser(this.editingUser.id, updatedUser) // Assuming you have an update method
        .then(() => {
          this.cancelEdit(); // Close the modal and reset
          // You might want to refresh the users$ observable here
        })
        .catch(error => {
          console.error('Error updating user:', error);
          // Handle the error appropriately, e.g., show an error message
        });
    }
  }

  cancelEdit() {
    this.editingUser = null;
    this.editForm.reset();
  }
}
