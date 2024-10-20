import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { register } from 'module';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from '../auth.guard';
import { UserManagementComponent } from './admin/user-management/user-management.component';


export const routes: Routes = [
    {path: '',redirectTo:'login',pathMatch:'full'},
    {path: 'login',component:LoginComponent},
    {path: 'register',component:RegisterComponent},
    {path: 'dashboard',component:DashboardComponent,canActivate: [AuthGuard]},
    {path: 'user-management', component: UserManagementComponent}
];
