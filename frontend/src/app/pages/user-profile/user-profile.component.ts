import { HttpErrorResponse, HttpResponseBase } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserRoles } from 'src/app/auth/constants/user-roles.const';
import { AuthApiService } from 'src/app/auth/services/auth-api.service';

import { AuthService } from 'src/app/auth/services/auth.service';
import { ImageApiService } from '../../common/services/image-api.service';
import { UserProfileService } from '../services/user-profile.service';

const DEFAULT_CHANGE_PASSWORD_ERROR = `Can't change password for unknown reason`;

type SetFileCallback = (image: string | ArrayBuffer, file: File) => void;

@Component({
  selector: 'app-user-profile',
  templateUrl: 'user-profile.component.html',
  styleUrls: ['user-profile.component.scss']
})

export class UserProfileComponent implements OnInit {
  username: string;

  userRoles: string;

  showChangeUserPasswordForm = false;

  changePasswordErrorMsg: string;

  changePasswordForm: UntypedFormGroup;

  userAvatarForm: UntypedFormGroup;

  uploadImageForm: UntypedFormGroup;

  canUploadImage: boolean;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly authService: AuthService,
    private readonly fb: UntypedFormBuilder,
    private readonly authApiService: AuthApiService,
    private readonly imageApiService: ImageApiService,
    private readonly userProfileService: UserProfileService
  ) { }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!!user) {
      this.username = user.username;
      this.userRoles = user.roles.join(', ');
    }

    this.showChangeUserPasswordForm = this.authService.checkRole(UserRoles.USER);

    this.buildForms();

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

  changeFile(event: Event, callback: SetFileCallback): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    this.onFileChanged(fileList[0], callback);
  }

  private onFileChanged(file: File, callback: SetFileCallback): void {
    const reader = new FileReader();
    reader.onload = _ => callback.apply(this, [reader.result, file]);
    reader.readAsDataURL(file);
  }

  setSelectedImage: SetFileCallback = (image: string | ArrayBuffer, file: File): void => {
    this.uploadImageForm.patchValue({ image, file })
  }

  setUserAvatar: SetFileCallback = (image: string | ArrayBuffer, file: File): void => {
    this.userAvatarForm.patchValue({ image, file });
  }

  submitImage(): void {
    if (this.uploadImageForm.invalid) {
      return;
    }

    const { file, name } = this.uploadImageForm.value;

    this.imageApiService.uploadMeme(file, name)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        console.log(response);
      });
  }


  submitAvatar(): void {
    if (this.userAvatarForm.invalid) {
      return;
    }

    const { file } = this.userAvatarForm.value;

    this.userProfileService.setUserAvatar(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        console.log(response);
        this.onFileChanged(response, this.setUserAvatar);
      });
  }

  private buildForms(): void {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required]
    });

    this.userAvatarForm = this.fb.group({
      file: [null, Validators.required],
      image: [null]
    });

    this.uploadImageForm = this.fb.group({
      file: [null, Validators.required],
      name: [null, Validators.required],
      image: [null]
    });
  }
}
