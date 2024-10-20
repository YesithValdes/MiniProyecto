import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule], // Assuming you're using CommonModule
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  user$: Observable<any> | undefined; // Use Observable for user data

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          // Get user data from Firestore based on user UID
          return this.afs.doc(`usuarios/${user.uid}`).valueChanges();
        } else {
          return of(null); // Return null if user is not logged in
        }
      })
    );
  }

  logout() {
    this.afAuth.signOut();
  }
}
