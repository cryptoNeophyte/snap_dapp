import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useEffect, useState } from 'react'

import Web3 from 'web3'
import SnapDappAbi from './contracts/SnapDapp.json'

import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'

function App() {
  const [currentAccount, setCurrentAccount] = useState('')
  const [loading, setLoader] = useState(true)
  const [hasEthereumAccount, setAccountState] = useState(true)
  const [contract, setContract] = useState()
  const [stateChangeFlag, setStateChangeFlag] = useState(0)
  const [web3Final, setWeb3] = useState(null)

  // error handling
  const [error, setError] = useState('')

  // setting using getter function of smart contract
  const [contractOwner, setContractOwner] = useState('')
  const [contractBalance, setContractBalance] = useState(0)
  const [imageCount, setImageCount] = useState(0)
  const [name, setName] = useState('')

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
        <HomePage
          contract={contract}
          currentAccount={currentAccount}
          stateChange={stateChange}
        />
      </div>
    )
  } else {
    return <h3>Loading...</h3>
  }
}

export default App