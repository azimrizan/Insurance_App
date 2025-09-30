import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginInput } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['customer', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';

      const loginData: LoginInput = this.loginForm.value;
      
      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.loading = false;
          // Use user role from server as truth, but honor selected redirect
          const selectedRole: string = this.loginForm.get('role')?.value;
          const serverRole = response?.user?.role;
          const role = selectedRole || serverRole;
          if (role === 'admin') {
            this.router.navigate(['/admin']);
          } else if (role === 'agent') {
            this.router.navigate(['/claims']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Login failed. Please try again.';
        }
      });
    }
  }
}
