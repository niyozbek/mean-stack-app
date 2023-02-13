import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, NgForm, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { mimeType } from './mime-type.validator'

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = ''
  enteredContent = ''
  isLoading = false
  private mode = 'create'
  private postId: string
  public post: Post
  private authSub: Subscription

  form: FormGroup
  imagePreview: string

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
    private authService: AuthService) { }

  ngOnInit() {
    this.authSub = this.authService
      .getAuthStatusListener()
      .subscribe(
        authStatue => {
          this.isLoading = false
        }
      )
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      // reactive approach is good, we shouldnt synchronize it when
      // there is no fitting element in the form.
      // we have hidden input and button here.
      // assigning to any of these will be incorrect
      image: new FormControl(null, { validators: [Validators.required] })
    })
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit'
        this.postId = paramMap.get('postId')
        //
        this.isLoading = true
        this.postsService.getPost(this.postId)
          .subscribe(postData => {
            //
            this.isLoading = false

            this.post = {
              id: postData._id,
              title: postData.title,
              content: postData.content,
              imagePath: postData.imagePath,
              creator: null
            }

            this.form.setValue({
              title: this.post.title,
              content: this.post.content,
              image: this.post.imagePath
            })
          })
      } else {
        this.mode = 'create'
        this.postId = null
      }
    })
  }

  onImagePicked(event: Event) {
    // type conversion
    const file = (event.target as HTMLInputElement).files[0]
    this.form.patchValue({ image: file })
    this.form.get('image').updateValueAndValidity()
    const reader = new FileReader()
    reader.onload = () => {
      this.imagePreview = reader.result as string
    }
    reader.readAsDataURL(file)
    // console.log()
  }

  onSavePost(form: NgForm) {
    if (this.form.invalid) {
      return
    }
    this.isLoading = true
    if (this.mode === 'create') {
      this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image)
    } else if (this.mode === 'edit') {
      this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image)
    }
    this.form.reset()
  }

  ngOnDestroy(){
    this.authSub.unsubscribe()
  }
}
