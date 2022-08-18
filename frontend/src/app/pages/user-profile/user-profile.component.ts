import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserRoles } from 'src/app/auth/constants/user-roles.const';
import { AuthApiService } from 'src/app/auth/services/auth-api.service';

import { AuthService } from 'src/app/auth/services/auth.service';
import { ImageApiService } from '../../common/services/image-api.service';

const DEFAULT_CHANGE_PASSWORD_ERROR = `Can't change password for unknown reason`;
@Component({
  selector: 'app-user-profile',
  templateUrl: 'user-profile.component.html',
  styleUrls: ['user-profile.component.scss']
})

export class UserProfileComponent implements OnInit {
  username: string;

  userRoles: string;

  showChangeUserPasswordForm = false;

  changePasswordForm: UntypedFormGroup;

  changePasswordErrorMsg: string;

  selectedFile: File;

  selectedImage: any;

  imageName: string;

  canUploadImage: boolean;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly authService: AuthService,
    private readonly fb: UntypedFormBuilder,
    private readonly authApiService: AuthApiService,
    private readonly imageApiService: ImageApiService
  ) { }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!!user) {
      this.username = user.username;
      this.userRoles = user.roles.join(', ');
    }

    this.showChangeUserPasswordForm = this.authService.checkRole(UserRoles.USER);

    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required]
    });

    this.loadPrivileges();
  }

  loadPrivileges(): void {
    const userRoles = this.authService.getCurrentUser().roles;
    this.canUploadImage = userRoles.includes(UserRoles.ADMIN);
  }

  changePassword(): void {
    if (this.changePasswordForm.invalid) return;

    this.authApiService.changePassword(this.changePasswordForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe((success) => {
        if (!success) {
          this.changePasswordErrorMsg = DEFAULT_CHANGE_PASSWORD_ERROR;
        }
        alert('Password succesfully changed. You will be redirected to login page now.');
        this.authService.logout();
      },
      (err: HttpErrorResponse) =>{
        this.changePasswordErrorMsg = err.message;
      });
  }

  onFileChanged(event): void {
    console.log(event);
    console.log(typeof event);
    this.selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = e => this.selectedImage = reader.result;
    reader.readAsDataURL(this.selectedFile);
  }

  onUpload(): void {
    if (!this.selectedFile) {
      alert("No file chosen!");
      return;
    }

    if (!this.imageName) {
      alert("No meme name chosen!");
      return;
    }

    this.imageApiService.uploadMeme(this.selectedFile, this.imageName)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        console.log(response);
      });
  }
}
