const Lava = artifacts.require('./Lava.sol');

const fixture = {
  minimumBalance: 40000000000000000,
  dataCost: 40000000,
  SIM: '1234567890123456789',
  badSIM: '0000000000000000000',
};

contract('Lava', (accounts) => {
  let contract;
  let web3;

  before(async () => {
    contract = await Lava.deployed();
    web3 = contract.constructor.web3;

    fixture.balance = contract.contract._eth.getBalance(accounts[0]);
    fixture.SIM_hex = web3.fromAscii(fixture.SIM).padEnd(66, 0);

    return Promise.resolve();
  });

  describe('Deploy', () => {
    it('parameters are correct', async () => {
      const owner = await contract.owner();
      const minimumBalance = await contract.minimumBalance();
      const dataCost = await contract.dataCost();

      assert.equal(owner, accounts[0]);
      assert.equal(minimumBalance.toNumber(), fixture.minimumBalance);
      assert.equal(dataCost.toNumber(), fixture.dataCost);

      return Promise.resolve();
    });
  });

  describe('isUser', () => {
    it('should return false if not a user', async () => {
      const isUser = await contract.isUser(accounts[1]);

      assert.equal(isUser, false);

      return Promise.resolve();
    });
  });

  describe('isSIM', () => {
    it('should return false if not a SIM', async () => {
      const isSIM = await contract.isSIM(fixture.badSIM);

      assert.equal(isSIM, false);

      return Promise.resolve();
    });
  });

  describe('isUserSIM', () => {
    it('should return false if not a user SIM', async () => {
      const isUserSIM = await contract.isUserSIM(accounts[1], fixture.badSIM);

      assert.equal(isUserSIM, false);

      return Promise.resolve();
    });
  });

  describe('getUser', () => {
    it('should fail if not user', async () => {
      try {
        await contract.getUser.call({
          from: accounts[1],
        });
      } catch (err) {
        assert.ok(err);
      }

      return Promise.resolve();
    });
  });

  describe('Register', () => {
    it('should fail if amount is less than minimum balance', async () => {
      try {
        await contract.register(fixture.SIM_hex, {
          from: accounts[0],
          value: 20000000000000000,
        });
      } catch (err) {
        assert.ok(err);
      }

      return Promise.resolve();
    });

    it('should register new user and new SIM', async () => {
        await contract.register(fixture.SIM_hex, {
          from: accounts[0],
          value: fixture.minimumBalance,
        });

        const isUser = await contract.isUser(accounts[0]);
        const isSIM = await contract.isSIM(fixture.SIM_hex);
        const isUserSIM = await contract.isUserSIM(accounts[0], fixture.SIM_hex);
        const user = await contract.getUser.call({
          from: accounts[0],
        });
        const SIM = await contract.getSIM(fixture.SIM_hex);

        const userBalance = user[0].toNumber();
        const userSIM_hex = user[1][0];
        const userSIM = web3.toAscii(userSIM_hex).replace(/\0/g, '');

        const userAddress = SIM[0];
        const dataPaid = SIM[1].toNumber();
        const dataConsumed = SIM[2].toNumber();
        const lastCollection = SIM[3].toNumber();
        const isActivated = SIM[4];
        const updateStatus = SIM[5];

        assert.equal(isUser, true);
        assert.equal(isSIM, true);
        assert.equal(isUserSIM, true);
        assert.equal(userBalance, fixture.minimumBalance);
        assert.equal(userSIM_hex, fixture.SIM_hex);
        assert.equal(userSIM, fixture.SIM);
        assert.equal(userAddress, accounts[0]);
        assert.equal(dataPaid, 0);
        assert.equal(dataConsumed, 0);
        assert.equal(lastCollection, 0);
        assert.equal(isActivated, false);
        assert.equal(updateStatus, true);

        return Promise.resolve();
    });
  });
});
