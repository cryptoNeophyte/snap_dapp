const fs = require('fs')
let ipfsAPI = require('ipfs-api')
let ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })

const uploadImageToIPFS = async (data, file) => {
  let myPromise = new Promise(function (resolve, reject) {
    let result
    ipfs.add(data, function (err, f) {
      if (err) console.log(err)
      console.log(f)
      const hash = f[0].hash
      // console.log('hash ====> ', hash)

      result = `https://ipfs.io/ipfs/${hash}`

      //clean auto-generated tmp folder after file gets uploaded to permanent location
      fs.unlink(file.tempFilePath, (err) => {
        if (err) console.log(err)
        console.log('Tmp files deleted!')
      })

      if (result) {
        resolve(result)
      } else {
        console.log('error while uploading')
      }
    })
  })
  try {
    let imageURL = await myPromise
    console.log(imageURL)
    return imageURL
  } catch (err) {
    console.log(err)
    return
  }
}

module.exports = uploadImageToIPFS
