const Lava = artifacts.require("./Lava.sol");

module.exports = function(deployer) {
  deployer.deploy(Lava);
};
