import React, { useEffect, useState, Suspense } from 'react'
import MinLoader from '../components/MinLoader'
// import ImageCard from '../components/ImageCard'

const LazyImg = React.lazy(() => import('../components/ImageCard'))

function HomePage({ images }) {
  return (
    <div className="home-page">
      {images && images.length > 0 ? (
        images.map((item) => (
          <div className="image-card" key={item.id}>
            <Suspense fallback={<MinLoader />}>
              {/* <ImageCard image={item} />   */}
              <LazyImg image={item.hash} />
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
