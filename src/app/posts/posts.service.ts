import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Post } from "./post.model";

const BACKEND_URL = environment.apiUrl + '/posts/'

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = []
  private postsUpdated = new Subject<{ posts: Post[], postCount: number }>()

  constructor(private httpClient: HttpClient, private router: Router) { }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&currentPage=${currentPage}`
    this.httpClient
      .get<{ message: string, posts: any, count: number }>(BACKEND_URL + queryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            }
          }),
          maxPosts: postData.count
        }
      }))
      .subscribe((transformedPostData) => {
        // console.log(transformedPostData)
        this.posts = transformedPostData.posts
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts
        })
      })
    // return [...this.posts]
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable()
  }

  getPost(id: string) {
    return this.httpClient.get<{ _id: string, title: string, content: string, imagePath: string, creator: string }>('BACKEND_URL/' + id)
  }

  addPost(title: string, content: string, image: File) {
    // const post: Post = { id: null, title, content }
    const postData = new FormData()
    postData.append('title', title)
    postData.append('content', content)
    postData.append('image', image, title)
    this.httpClient
      .post<{ message: string, post: Post }>(
        BACKEND_URL,
        postData
      )
      .subscribe(responseData => {
        // const post: Post = {
        //   id: responseData.post.id,
        //   title: title,
        //   content: content,
        //   imagePath: responseData.post.imagePath
        // }
        // // console.log(postData.message)
        // const postId = responseData.post.id
        // post.id = postId
        // this.posts.push(post)
        // this.postsUpdated.next([...this.posts])
        this.router.navigate(['/'])
      })
    // this.posts.push(post)
    // this.postsUpdated.next([...this.posts])
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData
    if (typeof image === 'object') {
      // new image
      postData = new FormData()
      postData.append('id', id)
      postData.append('title', title)
      postData.append('content', content)
      postData.append('image', image, title)
    } else {
      postData = { id, title, content, imagePath: image, creator: null }
    }
    this.httpClient
      .put(BACKEND_URL + id, postData)
      .subscribe(response => {
        // const updatedPosts = [...this.posts]
        // const oldPostIndex = updatedPosts.findIndex(p => p.id === id)
        // const post: Post = {
        //   id, title, content,
        //   imagePath: ''
        // }
        // updatedPosts[oldPostIndex] = post
        // this.posts = updatedPosts
        // this.postsUpdated.next([...this.posts])
        this.router.navigate(['/'])
      })
  }

  deletePost(postId: string) {
    return this.httpClient
      .delete(BACKEND_URL + postId)

  }
}
