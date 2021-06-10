const Post = require('../models/post')

// Middlewares - without next middleware waits forever
exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host')
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  })
  post.save()
    .then(createdPost => {
      // console.log(result)
      res.status(201).json({
        message: 'Post added successfully!',
        post: {
          // id: createdPost._id,
          // title: createdPost.title,
          // content: createdPost.content,
          // imagePath: createdPost.imagePath,
          ...createdPost,
          id: createdPost._id
        }
      })
    })
    .catch(error => {
      res.status(500).json({
        message: 'Creating a post failed!'
      })
    })
}

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath
  if (req.file) {
    const url = req.protocol + '://' + req.get('host')
    imagePath = url + '/images/' + req.file.filename
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  })
  Post.updateOne(
    { _id: req.params.id, creator: req.userData.userId },
    post
  )
    .then(result => {
      if (result.n > 0) {
        res.status(200).json({
          message: 'Update successful!'
        })
      } else {
        res.status(401).json({
          message: 'Not authorized message!'
        })
      }
      // console.log(result)
    })
    .catch(error => {
      res.status(500).json({
        message: 'Couldn\'t update post'
      })
    })
}

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post)
      } else {
        res.status(404).json({ message: 'Post not found!' })
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching post failed!'
      })
    })
}

exports.getPosts = (req, res, next) => {
  // console.log(req.query)
  const pageSize = +req.query.pageSize
  const currentPage = +req.query.currentPage
  let fetchedPosts
  const postQuery = Post.find()
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize)
  }
  postQuery
    .then((posts) => {
      fetchedPosts = posts
      return Post.count()
      // console.log(posts)

    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched succesfully!',
        posts: fetchedPosts,
        count: count
      })
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching posts failed!'
      })
    })
}

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      console.log(result)
      if (result.deletedCount > 0) {
        res.status(200).json({
          message: 'Deletion successful!'
        })
      } else {
        res.status(401).json({
          message: 'Not authorized message!'
        })
      }
    })
    .catch(error => {
      // console.log(error)
      res.status(500).json({ message: 'Fail!' })
    })
}
