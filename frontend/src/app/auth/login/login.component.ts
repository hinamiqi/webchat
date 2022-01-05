import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LocalStorageService } from 'src/app/utils/services/local-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private readonly localStorageService: LocalStorageService, private readonly router: Router) { }

  ngOnInit(): void {
  }

  private setJwt(): void {
    this.localStorageService.setDefaultToken();
  }

  login(): void {
    this.setJwt();
    this.router.navigate(['/']);
  }

}
