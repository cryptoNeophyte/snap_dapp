import React from 'react'
import axios from 'axios'

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

export const SuspenseImg = ({ src }) => {
  imgCache.read(src)
  return <img src={src} alt="image uploaded" width="300px" height="auto" />
}

function ImageCard({ image }) {
  return <SuspenseImg alt="" src={image} />
}

export default ImageCard
