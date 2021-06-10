import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { Post } from "../post.model";
import { PostsService } from "../posts.service";

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //   {title: 'First Post', content: 'This is the 1st post`s content'},
  //   {title: 'Second Post', content: 'This is the 2nd post`s content'},
  //   {title: 'Third Post', content: 'This is the 3rd post`s content'},
  // ]
  posts: Post[] = []
  isLoading = false
  totalPosts = 0
  postsPerPage = 1
  currentPage = 1
  pageSizeOptions = [1, 2, 5, 10]
  userIsAuthenticated = false
  userId: string
  private postsSub: Subscription
  private authStatusSub: Subscription

  constructor(public postsService: PostsService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true
    this.postsService.getPosts(this.postsPerPage, this.currentPage)
    this.userId = this.authService.getUserId()
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[], postCount: number }) => {
        this.isLoading = false
        this.totalPosts = postData.postCount
        this.posts = postData.posts
      })
    this.userIsAuthenticated = this.authService.getIsAuth()
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated
        this.userId = this.authService.getUserId()
      })
  }

  onChangedPage(pageData: PageEvent) {
    // length: 10
    // pageIndex: 0
    // pageSize: 1
    // previousPageIndex: 0
    // console.log(pageData)
    this.isLoading = true
    this.currentPage = pageData.pageIndex + 1
    this.postsPerPage = pageData.pageSize
    this.postsService.getPosts(this.postsPerPage, this.currentPage)
  }

  onDelete(postId: string) {
    this.isLoading = true
    this.postsService.deletePost(postId)
      .subscribe(() => {
        if (this.totalPosts - 1 === this.postsPerPage * (this.currentPage - 1)) {
          this.currentPage -= 1;
        }
        this.postsService.getPosts(this.postsPerPage, this.currentPage)
      }, () => {
        this.isLoading = false
      }
      )
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe()
    this.authStatusSub.unsubscribe()
  }
}
