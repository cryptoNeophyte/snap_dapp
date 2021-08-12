import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useHistory } from 'react-router-dom'
import Loader from './Loader'

const imgCache = {
  __cache: {},
  read(src) {
    if (!this.__cache[src]) {
      this.__cache[src] = new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          this.__cache[src] = true
          resolve(this.__cache[src])
        }
        img.src = src
      }).then((img) => {
        this.__cache[src] = true
      })
    }
    if (this.__cache[src] instanceof Promise) {
      throw this.__cache[src]
    }
    return this.__cache[src]
  },
}

function ImageCard({ src, image, address, snapDapp, stateChange }) {
  imgCache.read(src)
  const tip = 0.0001 // ETH
  const [buyAt, setBuyingPrice] = useState(0)
  const [loading, setLoader] = useState(false)
  let imgId = image.id
  const history = useHistory()
  const BASE_URL = process.env.REACT_APP_SERVER_URL

  function handleTip() {
    setLoader(true)
    console.log('image', image.id)
    const finalTip = window.web3.utils.toWei(`${tip}`, 'Ether') // converting ether into wei
    snapDapp.methods
      .tipImageOwner(imgId)
      .send({ from: address, value: finalTip })
      .then(async (result) => {
        console.log(result)

        // now add this info to the server
        const { data } = await axios.put(
          `${BASE_URL}/image/tipper/${imgId}/${address}`,
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
    console.log('buy at ', buyAt)
    if (buyAt > 0) {
      console.log('image', image.id)
      const finalBuy = window.web3.utils.toWei(`${buyAt}`, 'Ether') // converting ether into wei
    }
  }

  // console.log(image)

  return loading ? (
    <Loader />
  ) : (
    <div className="image-card-with-info">
      <div className="image-card-info-area">
        <div>
          {image.wantToSell ? (
            <p>
              <span>Selling Price: </span>
              {window.web3.utils.fromWei(image.minSellingPrice, 'ether')} ETH
            </p>
          ) : (
            <p className="NFS">Not for sale</p>
          )}

          {/* {image.imgOwner !== address && (
            <>
              {image.wantToSell && (
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
            </>
          )} */}
        </div>

        <div className="tips-area">
          <p>
            <span>Tips: </span>
            {window.web3.utils.fromWei(image.tipAmount, 'ether')} ETH
          </p>
          <div className="btns-area">
            {image.imgOwner !== address && (
              <div className="tip-btn">
                <input type="text" value={tip} readOnly={true} />
                ETH
                <button className="tip" onClick={handleTip}>
                  TIP
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <img
        src={src}
        alt="image uploaded"
        width="300px"
        height="auto"
        onClick={() => history.push(`/image/${image.id}`)}
      />
    </div>
  )
}

export default ImageCard
