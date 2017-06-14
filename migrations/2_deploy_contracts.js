const EarlyBird = artifacts.require("./EarlyBird.sol");

module.exports = function(deployer) {
  deployer.deploy(EarlyBird, 1000000000000000);
};
