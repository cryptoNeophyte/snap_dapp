const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({
  authorAddress: {
    type: String,
  },
  ownerAddress: {
    type: String,
  },
  imageLink: {
    type: String,
  },
  imgId: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  requests: [
    {
      address: {
        type: String,
      },
      value: {
        type: Number,
      },
    },
  ],
  buyers: {
    type: Array,
  },
  dealInfo: [
    {
      boughtAt: {
        type: Date,
        default: Date.now,
      },
      price: {
        type: Number,
      },
      buyerAddress: {
        type: String,
      },
      sellerAddress: {
        type: String,
      },
    },
  ],
})

module.exports = mongoose.model('Image', ImageSchema)
