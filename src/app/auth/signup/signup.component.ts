import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";
import { AuthService } from "../auth.service";

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false
  private authStatusSub: Subscription
  constructor(public authService: AuthService) { }

  onSignup(form: NgForm) {
    // console.log(form.value)
    if (form.invalid) {
      return
    }

    this.isLoading = true
    this.authService.createUser(form.value.email, form.value.password)
  }
  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatue => {
        this.isLoading = false
      })
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe()
  }
}
