import React, { useEffect, useState, Suspense } from 'react'
import MinLoader from '../components/MinLoader'
// import ImageCard from '../components/ImageCard'

import './styles/homePage.scss'

const LazyImg = React.lazy(() => import('../components/ImageCard'))

function HomePage({ images, address, snapDapp, stateChange }) {
  return (
    <div className="home-page">
      {images && images.length > 0 ? (
        images.map((item) => (
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
        <h1>No image uploaded yet!</h1>
      )}
    </div>
  )
}

export default HomePage
