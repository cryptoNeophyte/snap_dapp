const express = require('express')
const router = express.Router()

const {
  uploadImage,
  getAuthorImages,
  getOwnerImage,
  getSingleImage,
  getImageByImgId,
  deleteImage,
  addRequest,
  addBoughtInfo,
  removeRequest,
  addTipper,
} = require('../controllers/image.controller')

router.route('/:address').post(uploadImage)
router.route('/:id').delete(deleteImage)

router.route('/author/:address').get(getAuthorImages)
router.route('/owner/:address').get(getOwnerImage)
router.route('/single/:id').get(getSingleImage)
router.route('/imgId/:imgId').get(getImageByImgId)
router.route('/tipper/:imgId/:address').put(addTipper)
router.route('/request/:imgId/:address').put(addRequest)
router.route('/bought/:imgId/:address/:sellerAddress').put(addBoughtInfo)
router.route('/removeOrder/:imgId/:address').delete(removeRequest)

module.exports = router
