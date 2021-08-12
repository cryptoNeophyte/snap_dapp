const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Image = require('../models/Images.model')
const uploadImageToIPFS = require('../utils/ipfsImageUpload')
const fs = require('fs')
const { findByIdAndUpdate } = require('../models/Images.model')

/**
 * @desc            UPLOAD IMAGE
 * @route           POST /api/v1/image/:address
 * @access          Public
 */
exports.uploadImage = asyncHandler(async (req, res, next) => {
  // console.log('req.body ===> ', req.body)
  // console.log('req.param ===> ', req.params.address)
  // console.log('req.files ===> ', req.files)
  const { address } = req.params
  const { imgId, description } = req.body

  if (!address || !imgId || !description) {
    return next(
      new ErrorResponse('address, description and imgId are required!'),
    )
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

  const uploadedImage = await Image.create({
    authorAddress: address,
    ownerAddress: address,
    imageLink: imageURL,
    imgId,
    description,
  })

  res.status(201).json({
    success: true,
    image: uploadedImage,
  })
})

/**
 * @desc            DELETE IMAGE (when image link is not saved in blockchain)
 * @route           DELETE /api/v1/image/:id
 * @access          Public
 */
exports.deleteImage = asyncHandler(async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from bearer token in header
    token = req.headers.authorization.split(' ')[1]
  }

  const contractToken = process.env.CONTRACT_TOKEN

  // TODO: WILL MAKE IT MORE SECURE
  if (!token || token !== contractToken) {
    return next(new ErrorResponse('Not authorized to access this route!', 401))
  }

  await Image.findByIdAndDelete(req.params.id)
  res.status(201).json({
    success: true,
    message:
      'image successfully deleted! well it is uploaded to ipfs and its permanent. :|',
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
 * @desc            get single image by imgId
 * @route           GET /api/v1/image/single/:id
 * @access          Public
 */
exports.getSingleImage = asyncHandler(async (req, res, next) => {
  const image = await Image.findOne({ imgId: req.params.id })

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

// --------BLOCKCHAIN-----------------------------

/**
 * @desc            add tipper
 * @route           PUT/api/v1/image/tipper/:imgId/:address
 * @access          Public
 */
exports.addTipper = asyncHandler(async (req, res, next) => {
  const { address, imgId } = req.params
  const { value } = req.body
  let image = await Image.findOne({ imgId: imgId })

  if (!image) {
    return res.status(200).json({
      success: false,
      data: `no image with the imgId of ${imgId}`,
    })
  }

  let tipper = { ...image.tipper }

  // check if tipper has tipped before
  if (tipper[address]) {
    tipper[address] = {
      tipValue: tipper[address].tipValue + value,
      time: tipper[address.time] + 1,
    }
  } else {
    tipper[address] = {
      tipValue: value,
      time: 1,
    }
  }

  image = await Image.findByIdAndUpdate(image._id, { tipper })

  res.status(200).json({
    success: true,
    data: image,
    message: 'successfully tipped!',
  })
})

/**
 * @desc            add request with address and value at requests field and also add it to buyers list
 * if buyer is already added then no need to add him again (apply some logic)
 * @route           PUT/api/v1/image/request/:imgId/:address
 * @access          Public
 */
exports.addRequest = asyncHandler(async (req, res, next) => {
  const { address, imgId } = req.params
  const { value } = req.body
  let image = await Image.findOne({ imgId: imgId })

  if (!image) {
    return res.status(200).json({
      success: false,
      data: `no image with the imgId of ${imgId}`,
    })
  }

  //// check if this buyer is already in the list or not
  // let buyers = [...image.buyers]
  // let isPresent = false
  // for (let item of buyers) {
  //   if (item === address) isPresent = true
  //   if (isPresent) break
  // }

  // if (isPresent) {
  //   return res.status(200).json({
  //     success: false,
  //     data: image,
  //     message: 'everything up to date!',
  //   })
  // }

  let requests = [...image.requests, { address, value }]
  // add to the list of buyers
  let buyers = [...image.buyers, address]

  image = await Image.findByIdAndUpdate(image._id, { requests, buyers })

  res.status(200).json({
    success: true,
    data: image,
    message: 'request successfully added!',
  })
})

// IF IMAGE IS BOUGHT
/**
 * @desc            add request with price, buyerAddress, sellerAddress and newOwner at dealInfo field and also add it to buyers list
 * if buyer is already added then no need to add him again (apply some logic)
 * @route           PUT /api/v1/image/bought/:imgId/:address/:sellerAddress
 * @access          Public
 */
exports.addBoughtInfo = asyncHandler(async (req, res, next) => {
  const { address, imgId, sellerAddress } = req.params
  const { value } = req.body
  let image = await Image.findOne({ imgId: imgId })

  if (!image) {
    return res.status(200).json({
      success: false,
      data: `no image with the imgId of ${imgId}`,
    })
  }

  const dealInfo = [
    ...image.dealInfo,
    {
      price: value,
      buyerAddress: address,
      sellerAddress,
    },
  ]

  image = await Image.findByIdAndUpdate(image._id, {
    dealInfo,
  })

  res.status(200).json({
    success: true,
    data: image,
    message: 'successfully bought!',
  })
})

/**
 * @desc            remove order
 * @route           DELETE/api/v1/image/removeOrder/:imgId/:address
 * @access          Public
 */
exports.removeRequest = asyncHandler(async (req, res, next) => {
  const { address, imgId } = req.params
  let image = await Image.findOne({ imgId: imgId })

  if (!image) {
    return res.status(200).json({
      success: false,
      data: `no image with the imgId of ${imgId}`,
    })
  }

  // get buyers list and remove address
  let buyers = [...image.buyers]
  buyers = buyers.map((item) => item !== address)

  let requests = [...image.requests]
  requests = requests.filter((item) => item.address !== address)

  image = await Image.findByIdAndUpdate(image._id, { requests, buyers })

  res.status(200).json({
    success: true,
    data: image,
    message: 'order successfully removed!',
  })
})
