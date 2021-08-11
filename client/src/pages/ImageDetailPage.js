import React, { useState, useEffect } from 'react'
import { useParams, useHistory, useLocation } from 'react-router-dom'
import Loader from '../components/Loader'
import './styles/imageDetail.scss'
import axios from 'axios'

function ImageDetailPage({ address, stateChange, snapDapp }) {
  const [image, setImage] = useState(null)
  const [buyAt, setBuyingPrice] = useState(0)
  const [loading, setLoader] = useState(false)
  const [price, setPrice] = useState(0)

  const BASE_URL = process.env.REACT_APP_SERVER_URL
  const tip = 0.0001 // ETH
  const params = useParams()

  async function loadData() {
    setLoader(true)
    if (snapDapp) {
      let img = await snapDapp.methods.images(params.id).call()
      setImage(img)
      setLoader(false)
      setPrice(window.web3.utils.fromWei(img.minSellingPrice, 'ether'))
    }
  }

  useEffect(() => {
    loadData()
  }, [snapDapp])

  function handleTip() {
    setLoader(true)
    const finalTip = window.web3.utils.toWei(`${tip}`, 'Ether') // converting ether into wei
    snapDapp.methods
      .tipImageOwner(image.id)
      .send({ from: address, value: finalTip })
      .then(async (result) => {
        console.log(result)

        // now add this info to the server
        const { data } = await axios.put(
          `${BASE_URL}/image/tipper/${image.id}/${address}`,
        )
        console.log(data)
        alert('Thank You!') //TODO: show some animation
        // history.push('/')
        setLoader(false)
        stateChange()
      })
      .catch((err) => {
        alert('Error!')
        console.log(err)
        setLoader(false)
      })
  }

  function handleBuy() {
    if (buyAt > 0) {
      setLoader(true)
      const imgId = image.id
      console.log('image', buyAt)
      const finalBuy = window.web3.utils.toWei(`${buyAt}`, 'Ether') // converting ether into wei

      snapDapp.methods
        .buyImageRequest(imgId)
        .send({ from: address, value: finalBuy })
        .then(async (result) => {
          console.log(result)

          let actionType = 'request'

          let { ImageRequest, ImageBought } = result.events

          if (ImageRequest) {
            // let {msg, actionType} = ImageRequest.returnValues
            actionType = 'request'
            alert('Order added!')
          } else {
            actionType = 'buy'
            alert('Hurray! image is yours.')
          }

          if (actionType !== 'buy') {
            // buy info server call
            const {
              data,
            } = await axios.put(
              `${BASE_URL}/image/request/${image.id}/${address}`,
              { value: finalBuy },
            )
            console.log('data ====> ', data)
            stateChange()
          } else {
            // request info server call
            const {
              data,
            } = await axios.put(
              `${BASE_URL}/image/bought/${image.id}/${address}/${image.imgOwner}`,
              { value: finalBuy },
            )
            console.log('data ====> ', data)
            stateChange()
          }
          setLoader(false)
        })
        .catch((err) => {
          alert('Error!')
          console.log(err)
          setLoader(false)
        })
    }
  }

  function handleSell() {
    if (price > 0) {
      setLoader(true)
      const imgId = image.id
      console.log('image', buyAt)
      const sellAt = window.web3.utils.toWei(`${price}`, 'Ether') // converting ether into wei
      snapDapp.methods
        .changePriceOrSell(imgId, sellAt)
        .send({ from: address })
        .then((result) => {
          console.log(result)
          alert('Price Updated!')
          setLoader(false)
          stateChange()
        })
        .catch((err) => {
          alert('Error!')
          console.log(err)
          setLoader(false)
        })
    }
  }

  function removeFromSale() {
    const imgId = image.id
    snapDapp.methods
      .removeFromSale(imgId)
      .send({ from: address })
      .then((result) => {
        console.log(result)
        alert('Removed From Sale!')
        setLoader(false)
        stateChange()
      })
      .catch((err) => {
        alert('Error!')
        console.log(err)
        setLoader(false)
      })
  }

  return loading ? (
    <Loader />
  ) : (
    <div className="detail-page">
      {!image ? (
        <h2>NO IMAGE WITH THE ID OF {params.id}</h2>
      ) : (
        <div className="img-info">
          <div className="img-box">
            <img src={image.hash} alt="" />
          </div>
          <div className="info-box">
            <p>
              <span>Author :</span>
              {image.author}
            </p>
            <p>
              <span>Owner :</span>
              {image.imgOwner}
            </p>
            <p>
              <span>Tip Earned :</span>
              {window.web3.utils.fromWei(image.tipAmount, 'ether')} ETH
            </p>
            {image.wantToSell ? (
              <div>
                <p>
                  <span>Min Price: </span>
                  {window.web3.utils.fromWei(image.minSellingPrice, 'ether')}ETH
                </p>
                {image.imgOwner !== address && (
                  <div className="buy-btn">
                    ETH
                    <input
                      type="number"
                      value={buyAt}
                      min="0.001"
                      step="0.001"
                      onChange={(event) => setBuyingPrice(event.target.value)}
                    />
                    <button className="buy" onClick={handleBuy}>
                      BUY
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p>NOT FOR SALE</p>
              </div>
            )}
            {image.imgOwner !== address && image.author !== address && (
              <div className="tip-btn">
                ETH
                <input type="text" value={tip} readOnly={true} />
                <button className="tip" onClick={handleTip}>
                  TIP
                </button>
              </div>
            )}
            {image.imgOwner === address && (
              <div className="handle-owner-work">
                {!image.wantToSell && (
                  <div>
                    ETH
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      step="0.001"
                    />
                    <button onClick={handleSell}>SELL</button>
                  </div>
                )}
                {image.wantToSell && (
                  <div>
                    <div>
                      ETH
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        step="0.001"
                      />
                      <button onClick={handleSell}>CHANGE PRICE</button>
                    </div>
                    <button onClick={removeFromSale}>REMOVE FROM SALE</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageDetailPage
