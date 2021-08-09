const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Image = require('../models/Images.model')
const uploadImageToIPFS = require('../utils/ipfsImageUpload')
const fs = require('fs')

/**
 * @desc            UPLOAD IMAGE
 * @route           POST /api/v1/image/:address
 * @access          Public
 */
exports.uploadImage = asyncHandler(async (req, res, next) => {
  const { address } = req.params
  const { imgId } = req.body

  if (!address || !imgId) {
    return next(new ErrorResponse('address and imgId are required!'))
  }

  if (!req.files) {
    return next(new ErrorResponse('Please add an image', 400))
  }

  const { image } = req.files

  if (!image) {
    return next(new ErrorResponse('Please upload an image', 400))
  }

  // check type of file
  if (!image.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image only', 400))
  }

  //----------- UPLOAD IMAGE TO IPFS AND SAVE HASH-----------------------------
  let data = fs.readFileSync(image.tempFilePath)
  let imageURL = await uploadImageToIPFS(data, image)

  await Image.create({
    authorAddress: address,
    ownerAddress: address,
    imageLink: imageURL,
    imgId,
  })

  const images = await Image.find()
  res.status(201).json({
    success: true,
    data: images,
  })
})

/**
 * @desc            get images by authorAddress
 * @route           GET /api/v1/image/author/:address
 * @access          Public
 */
exports.getAuthorImages = asyncHandler(async (req, res, next) => {
  const images = await Image.find({ authorAddress: req.params.address })
  res.status(201).json({
    success: true,
    data: images,
  })
})

/**
 * @desc            get images by ownerAddress
 * @route           GET /api/v1/image/owner/:address
 * @access          Public
 */
exports.getOwnerImage = asyncHandler(async (req, res, next) => {
  const images = await Image.find({ ownerAddress: req.params.address })
  res.status(201).json({
    success: true,
    data: images,
  })
})

/**
 * @desc            get single image by id
 * @route           GET /api/v1/image/single/:id
 * @access          Public
 */
exports.getSingleImage = asyncHandler(async (req, res, next) => {
  const image = await Image.findById(req.params.id)

  if (!image) {
    return res.status(200).json({
      success: false,
      data: `no image with the id of ${req.params.id}`,
    })
  }
  res.status(201).json({
    success: true,
    data: image,
  })
})

/**
 * @desc            get single image by id
 * @route           GET /api/v1/image/imgId/:imgId
 * @access          Public
 */
exports.getImageByImgId = asyncHandler(async (req, res, next) => {
  const image = await Image.findOne({ imgId: req.params.imgId })

  if (!image) {
    return res.status(200).json({
      success: false,
      data: `no image with the imgId of ${req.params.imgId}`,
    })
  }
  res.status(201).json({
    success: true,
    data: image,
  })
})
