import React, { useEffect, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'

function HomePage({ images }) {
  return images && images.length > 0 ? (
    images.map((item) => (
      <div className="image-card" key={item.id}>
        <LazyLoadImage
          src={item.hash}
          alt=""
          style={{ width: '300px', height: 'auto' }}
        />
      </div>
    ))
  ) : (
    <h1>No image uploaded yet!</h1>
  )
}

export default HomePage
