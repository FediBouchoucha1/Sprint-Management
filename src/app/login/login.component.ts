import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.loginForm.controls; }

  login() {
    this.submitted = true;
  
    if (this.loginForm.invalid) {
      return;
    }
  
    const loginData = new URLSearchParams();
    loginData.set('grant_type', "password");
    loginData.set('username', this.loginForm.value.userName);
    loginData.set('password', this.loginForm.value.password);
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
  
    this.http.post('https://enterprise.barthauer.cloud/KAOS_stage/Token', loginData.toString(), { headers })
      .subscribe(
        (response: any) => {
          console.log('Login successful', response);
  
          // Save token to localStorage
          localStorage.setItem('access_token', response.access_token);
  
          // Navigate to dashboard
          this.router.navigate(['/dashboard/sprint']);
        },
        error => {
          console.error('Login failed', error);
          this.errorMessage = 'Invalid username or password';
        }
      );
  }
  

  staticLogin() {
    if (this.loginForm.value.userName === 'E.GHadhab' && this.loginForm.value.password === 'GceS0r5urljbzZndqET8') {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid username or password';
    }
  }
}
