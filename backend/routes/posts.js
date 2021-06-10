const express = require('express')
const checkAuth = require('../middleware/check-auth')

const PostsController = require('../controllers/posts')
const extractFile = require('../middleware/file')

const router = express.Router()



router.post('', checkAuth, extractFile, PostsController.createPost)

router.put('/:id', checkAuth, extractFile, PostsController.updatePost)

router.get('/:id', PostsController.getPost)

router.get('', PostsController.getPosts)

router.delete('/:id', checkAuth, PostsController.deletePost)

module.exports = router
