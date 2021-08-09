import React from 'react'
import './styles/loader.scss'

function Loader({ bgc, color }) {
  // document.body.style.overflow = 'hidden'
  return (
    <div
      className="loader-container-outer"
      style={{ backgroundColor: bgc ? bgc : '#fff' }}
    >
      <div className="lds-ripple">
        <div
          style={{
            border: color ? `4px solid ${color}` : '4px solid rgb(16, 129, 95)',
          }}
        ></div>
        <div
          style={{
            border: color ? `4px solid ${color}` : '4px solid rgb(16, 129, 95)',
          }}
        ></div>
      </div>
    </div>
  )
}

export default Loader
