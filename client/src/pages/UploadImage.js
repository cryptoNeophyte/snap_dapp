import React, { useState, useRef } from 'react'
import axios from 'axios'
import Loader from '../components/Loader'
import './styles/uploadImage.scss'
import { useHistory } from 'react-router-dom'

function UploadImage({ snapDapp, address, imageCount }) {
  const history = useHistory()
  const [loading, setLoader] = useState(false)
  const [description, setDescription] = useState('')
  const [minSellingPrice, setMinSellingPrice] = useState('')
  const [isSelling, setSellingOption] = useState(true)
  const [imageSource, setImageSource] = useState('')
  const [imgName, setImageName] = useState('No file chosen')
  const [imgValue, setImageValue] = useState(null)

  // used for resetting form value
  const ref = useRef()

  function readURL(event) {
    let input = event.target
    console.log(event.target.value)

    if (input.files && input.files[0]) {
      setImageValue(input.files[0])
      setImageName(input.files[0].name)
      var reader = new FileReader()
      reader.onload = function (e) {
        setImageSource(e.target.result)
      }

      reader.readAsDataURL(input.files[0])
    }
  }

  function resetForm() {
    setDescription('')
    ref.current.value = ''
    setImageValue(null)
    setImageSource('')
    setImageName('No file chosen')
    setMinSellingPrice(0)
  }

  async function handleImageUpload(e) {
    e.preventDefault()
    try {
      console.log('submitting')

      if (!description || minSellingPrice <= 0) {
        return alert('description and minimum selling price are required!')
      }

      setLoader(true)
      console.log('call server and submit file to ipfs')

      let imgId = imageCount + 1

      const uploadURL = `${process.env.REACT_APP_SERVER_URL}/image/${address}`

      console.log(uploadURL)

      const formData = new FormData()

      formData.append('image', imgValue)
      console.log(imgValue)
      formData.append('description', description)
      formData.append('imgId', imgId)

      const { data } = await axios.post(uploadURL, formData)

      console.log(data)
      if (data.success) {
        const hash = data.image.imageLink
        const desc = data.image.description
        const minimumSellingPrice = minSellingPrice * 1000000000000000000 // converting ether into wei
        const wantToSell = isSelling
        const imageMongooseId = data.image._id // will do something with it in future

        snapDapp.methods
          .uploadImage(hash, desc, minimumSellingPrice, wantToSell)
          .send({ from: address })
          .then((result) => {
            console.log('uploaded')
            setLoader(false)
            resetForm()
            alert('image successfully uploaded!')
            history.push('/')
          })
          .catch((err) => {
            alert(err.message)
            console.log(err)
          })
        // .on('transactionHash', (hash) => {

        //   // TODO: if unsuccessful then delete this data from the backend server
        // })
        setLoader(false)
      } else {
        alert('ERROR!')
        setLoader(false)
      }
    } catch (err) {
      alert(err.message)
      console.log(err)
      setLoader(false)
    }
  }

  return loading ? (
    <Loader />
  ) : (
    <div className="upload-image-page">
      <form className="create-category-form" onSubmit={handleImageUpload}>
        <label>
          Description:
          <textarea
            type="text"
            value={description}
            placeholder="Image Description..."
            minLength="10"
            onChange={(event) => setDescription(event.target.value)}
            required={true}
            rows="4"
            cols="35"
            maxLength="250"
          />
        </label>
        <label>
          Minimum Selling Price In ETH:
          <input
            type="Number"
            value={minSellingPrice}
            placeholder="ETH"
            min="0"
            step="0.001"
            onChange={(event) => setMinSellingPrice(event.target.value)}
            required={true}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            placeholder="want to sell ?"
            onChange={(event) => setSellingOption(!isSelling)}
            checked={isSelling}
          />
          want to sell?
        </label>
        <div className="cat-image">
          <input
            type="file"
            placeholder="Name"
            accept=".png, .jpg, .jpeg, .img"
            onChange={readURL}
            ref={ref}
            id="actual-btn"
            hidden
            required={true}
          />
          <span id="file-chosen">{imgName}</span>
          <label htmlFor="actual-btn">Choose Image</label>
        </div>
        <div className="btns-box">
          <button
            type="button"
            onClick={resetForm}
            disabled={
              description || minSellingPrice > 0 || imgValue ? false : true
            }
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={
              description && minSellingPrice > 0 && imgValue ? false : true
            }
          >
            Upload
          </button>
        </div>
      </form>
      <div className="selected-img">
        <img className="selected-img-box" src={imageSource} alt="" />
      </div>
    </div>
  )
}

export default UploadImage
