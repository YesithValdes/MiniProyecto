import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }

  getUsers(): Observable<any[]> {
    return this.afs.collection('usuarios').valueChanges();
  }

  updateUser(userId: string, data: any): Promise<void> {
    return this.afs.doc(`usuarios/${userId}`).update(data);
  }

  isAdmin(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc(`usuarios/${user.uid}`).valueChanges()
            .pipe(
              map((userData: any) => userData?.rol === 'admin' || false) // Assuming 'admin' is the admin role
            );
        } else {
          return of(false); // User is not logged in
        }
      })
    );
  }
}
