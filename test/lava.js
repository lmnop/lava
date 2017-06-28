const Lava = artifacts.require("./Lava.sol");

const fixture = {};

contract('Lava', (accounts) => {
  let contract;

  before(async () => {
    contract = await Lava.deployed();
    fixture.balance = contract.contract._eth.getBalance(accounts[0]);

    return Promise.resolve();
  });

  describe('Deploy', () => {
    it('parameters are correct', async () => {
      const owner = await contract.owner();

      return Promise.resolve();
    });
  });
});
