import React from 'react'
import Identicon from 'identicon.js'
import { NavLink } from 'react-router-dom'

function Navbar({ currentAccount, connect }) {
  function handleConnect() {
    connect()
  }
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <NavLink to="/" className="navbar-brand">
          SNAPDAPP
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/uploaded" className="nav-link active">
                Uploaded
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/my_images" className="nav-link active">
                My Images
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/orders" className="nav-link active">
                Orders
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/upload_image" className="nav-link active">
                Upload Image
              </NavLink>
            </li>
          </ul>
          {currentAccount ? (
            <>
              <img
                className="ml-2"
                width="30"
                height="30"
                src={`data:image/png;base64,${new Identicon(
                  currentAccount,
                  30,
                ).toString()}`}
              />
              <h6>{currentAccount}</h6>
            </>
          ) : (
            <button className="btn btn-outline-success" onClick={handleConnect}>
              CONNECT
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
