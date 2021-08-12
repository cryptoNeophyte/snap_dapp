import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useEffect, useState } from 'react'
import { Route, Redirect, Switch } from 'react-router-dom'

import Web3 from 'web3'
import SnapDappAbi from './contracts/SnapDapp.json'

import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import UploadImage from './pages/UploadImage'
import ImageDetailPage from './pages/ImageDetailPage'

function App() {
  const [loading, setLoader] = useState(true)
  const [hasEthereumAccount, setAccountState] = useState(true)

  const [currentAccount, setCurrentAccount] = useState('')
  const [contract, setContract] = useState()

  const [stateChangeFlag, setStateChangeFlag] = useState(0)
  const [web3Final, setWeb3] = useState(null)

  // error handling
  const [error, setError] = useState('')

  // setting using getter function of smart contract
  const [name, setName] = useState('')
  const [contractOwner, setContractOwner] = useState('')
  const [contractBalance, setContractBalance] = useState(0)
  const [imageCount, setImageCount] = useState(0)
  const [images, setImages] = useState([])

  useEffect(() => {
    loadWeb3()
    LoadBlockchainData()
  }, [currentAccount, stateChangeFlag])

  function stateChange() {
    setStateChangeFlag(stateChangeFlag + 1)
  }

  async function loadWeb3Account(provider) {
    try {
      const web3 = provider

      const accounts = await web3.eth.getAccounts()
      const account = accounts[0]
      setCurrentAccount(account)
      console.log('account', account)

      setWeb3(web3)

      return web3
    } catch (err) {
      console.log(err)
    }
  }

  async function loadWeb3() {
    // console.log('window.ethereum', window.ethereum)
    // console.log('window.web3', window.web3)

    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)

      await window.ethereum.enable() // here metamask will connect to our fullstack app
      await loadWeb3Account(window.web3)
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
      await loadWeb3Account(window.web3)
    } else {
      window.alert('Non Ethereum browser detected! please use metamask.')
      setAccountState(false)
    }
  }

  async function LoadBlockchainData() {
    try {
      setError('')
      setLoader(true)
      const web3 = await loadWeb3Account(window.web3)

      console.log('web3 ===> ', web3)
      console.log('web3Final ====> ', web3Final)

      const networkId = await web3.eth.net.getId()
      console.log('networkId', networkId)

      const networkData = SnapDappAbi.networks[networkId]
      console.log('networkData', networkData)

      if (networkData) {
        // console.log('SnapDappAbi.abi', SnapDappAbi.abi)
        // console.log('networkData.address', networkData.address)

        // fetching snapDapp contract
        const snapDapp = new web3.eth.Contract(
          SnapDappAbi.abi,
          networkData.address,
        )
        console.log('snapDapp ---> ', snapDapp)

        setContract(snapDapp)

        // fetching contract owner address
        const contractOwner = await snapDapp.methods.contractOwner().call()
        setContractOwner(contractOwner)

        // fetching contract balance
        const contractBalance = await snapDapp.methods.getBalance().call()
        setContractBalance(contractBalance)

        // fetching image count
        const imageCount = await snapDapp.methods.imageCount().call()
        setImageCount(imageCount)

        // Now fetch all images one by one and add in the imagesList(because this is the only method)
        // TODO:
        const tempImage = []
        for (let i = imageCount; i >= 1; i--) {
          const image = await snapDapp.methods.images(i).call()
          tempImage.push(image)
        }

        // console.log(tempImage)
        // console.log(tempImage[0].description)
        setImages(tempImage)

        // fetching name of contract
        const name = await snapDapp.methods.name().call()
        setName(name)
      } else {
        setError('The smart contract is not deployed to current network!')
        window.alert('The smart contract is not deployed to current network!')
      }
    } catch (err) {
      console.log(err)
    }
  }

  async function Connect() {
    // console.log('connect to metamask!')
    loadWeb3()
  }

  if (hasEthereumAccount || !loading) {
    return (
      <div className="App">
        {error && <h2>{error}</h2>}
        <Navbar currentAccount={currentAccount} connect={Connect} />

        <Switch>
          <Route exact path="/">
            <HomePage
              snapDapp={contract}
              address={currentAccount}
              stateChange={stateChange}
              images={images}
            />
          </Route>
          <Route exact path="/uploaded">
            <HomePage
              snapDapp={contract}
              address={currentAccount}
              stateChange={stateChange}
              images={images}
            />
          </Route>
          <Route exact path="/my_images">
            <HomePage
              snapDapp={contract}
              address={currentAccount}
              stateChange={stateChange}
              images={images}
            />
          </Route>
          <Route exact path="/search/:id">
            <HomePage
              snapDapp={contract}
              address={currentAccount}
              stateChange={stateChange}
              images={images}
            />
          </Route>
          <Route exact path="/orders">
            <HomePage
              snapDapp={contract}
              address={currentAccount}
              stateChange={stateChange}
              images={images}
            />
          </Route>
          <Route exact path="/upload_image">
            <UploadImage
              address={currentAccount}
              stateChange={stateChange}
              imageCount={imageCount}
              snapDapp={contract}
            />
          </Route>
          <Route exact path="/image/:id">
            <ImageDetailPage
              address={currentAccount}
              stateChange={stateChange}
              snapDapp={contract}
            />
          </Route>
          <Redirect to="/" />
        </Switch>
      </div>
    )
  } else {
    return <h3>Loading...</h3>
  }
}

export default App
