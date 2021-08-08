const SnapDapp = artifact.require('SnapDapp')
// in our case artifacts is the directory client/src/contracts (which contains json files of all the contract after compiling)
// SnapDapp is the name of contract

const addr = '0x10bd2A151e51A947025235a45B9eF9e82C80188d'

module.exports = function (deployer) {
  deployer.deploy(SnapDapp, addr)
}
// in constructor SnapDapp takes one parameter which is address
