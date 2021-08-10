import React, { useState, useRef } from 'react'
import axios from 'axios'
import Loader from '../components/Loader'
import './styles/uploadImage.scss'
import { useHistory } from 'react-router-dom'

function UploadImage({ snapDapp, address, imageCount, stateChange }) {
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

      let imgId = Number(imageCount) + 1

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
        const minimumSellingPrice = window.web3.utils.toWei(
          `${minSellingPrice}`,
          'Ether',
        ) // converting ether into wei

        console.log('minimumSellingPrice ==> ', minimumSellingPrice)
        const wantToSell = isSelling
        const imageMongooseId = data.image._id // will do something with it in future

        snapDapp.methods
          .uploadImage(hash, desc, minimumSellingPrice, wantToSell)
          .send({ from: address })
          .then((result) => {
            console.log('uploaded')
            setLoader(false)
            resetForm()
            alert(
              'image successfully uploaded! It may take 2-5 minutes to load your image on home page',
            )
            history.push('/')
            stateChange() // state change is a dependency of useEffect at App.js. calling this will trigger useEffect and fetch new data
          })
          .catch((err) => {
            alert(err.message)
            console.log(err)
            //if unsuccessful then delete this data from the backend server // TODO: will make it more secure
            axios.delete(
              `${process.env.REACT_APP_SERVER_URL}/image/${imageMongooseId}`,
              {
                headers: {
                  authorization: `Bearer ${process.env.REACT_APP_CONTRACT_TOKEN}`,
                },
              },
            )
            // for avoiding focus error I am doing following things
            ref.current.value = ''
            setImageValue(null)
            setImageSource('')
            setImageName('No file chosen')
          })
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
