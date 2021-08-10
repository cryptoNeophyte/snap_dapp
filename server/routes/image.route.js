const express = require('express')
const router = express.Router()

const {
  uploadImage,
  getAuthorImages,
  getOwnerImage,
  getSingleImage,
  getImageByImgId,
  deleteImage,
} = require('../controllers/image.controller')

router.route('/:address').post(uploadImage)
router.route('/:id').delete(deleteImage)

router.route('/author/:address').get(getAuthorImages)
router.route('/owner/:address').get(getOwnerImage)
router.route('/single/:id').get(getSingleImage)
router.route('/imgId/:imgId').get(getImageByImgId)

module.exports = router
