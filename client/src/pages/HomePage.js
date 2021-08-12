import axios from 'axios'
import React, { useEffect, useState, Suspense } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import MinLoader from '../components/MinLoader'
// import ImageCard from '../components/ImageCard'

import './styles/homePage.scss'

const LazyImg = React.lazy(() => import('../components/ImageCard'))

function HomePage({ images, address, snapDapp, stateChange }) {
  const location = useLocation()
  const pathname = location.pathname
  const params = useParams()
  const history = useHistory()
  const [newImgs, setNewImgs] = useState(null)
  const [imageID, setImageID] = useState('')

  const BASE_URL = process.env.REACT_APP_SERVER_URL

  useEffect(() => {
    if (address) {
      if (pathname === '/uploaded') {
        getImages('author')
      } else if (pathname === '/my_images') {
        getImages('owner')
      } else if (pathname === '/orders') {
        getOrders()
      } else if (pathname.startsWith('/search')) {
        handleSearch(params.id)
      } else {
        console.log('home')
        setNewImgs(images)
      }
    }
  }, [pathname, images])

  async function getOrders() {
    try {
      let arr = await snapDapp.methods.getOrders(address).call()
      let imgs = []
      for (let item of arr) {
        let temp = await snapDapp.methods.images(parseInt(item)).call()
        imgs.push(temp)
      }
      setNewImgs(imgs)
    } catch (err) {
      console.log(err)
    }
  }

  async function getImages(type) {
    try {
      let data

      if (type === 'author') {
        data = await axios.get(`${BASE_URL}/image/author/${address}`)
      } else if (type === 'owner') {
        data = await axios.get(`${BASE_URL}/image/owner/${address}`)
      }

      if (data && data.data) {
        let arr = data.data.data

        // Now loop through this array and get images from blockchain one by one and assign newImg new array
        let finalArray = []
        for (let item of arr) {
          // console.log(item)

          let img = await snapDapp.methods.images(item.imgId).call()
          // now double check if owner and author are correct or not
          finalArray.push(img)
        }
        setNewImgs(finalArray)
      }
    } catch (err) {
      console.log(err)
    }
  }

  async function handleSearch(id) {
    try {
      if (id) {
        let img = await snapDapp.methods.images(id).call()
        if (img.author.startsWith('0x0')) {
          setNewImgs([])
        } else {
          setNewImgs([img])
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  console.log(newImgs)

  return (
    <div className="home-page">
      <div className="search-bar">
        <input
          type="text"
          placeholder="image id"
          value={imageID}
          onChange={(e) => setImageID(e.target.value)}
        />
        <button onClick={() => history.push(`/search/${imageID}`)}>
          Search
        </button>
      </div>
      <div className="home-page-images">
        {newImgs && newImgs.length > 0 ? (
          newImgs.map((item) => (
            <div className="image-card" key={item.id}>
              <Suspense fallback={<MinLoader />}>
                {/* <ImageCard image={item} />   */}
                <LazyImg
                  src={item.hash}
                  image={item}
                  address={address}
                  snapDapp={snapDapp}
                  stateChange={stateChange}
                />
              </Suspense>
            </div>
          ))
        ) : (
          <h1>NO IMAGE FOUND!</h1>
        )}
      </div>
    </div>
  )
}

export default HomePage
