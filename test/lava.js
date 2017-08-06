/* global artifacts, assert, contract */

const Lava = artifacts.require('./Lava.sol');

const fixture = {
  activationFee: 40000000000000000,
  minimumBalance: 40000000000000000,
  etherPerByte: 10000000,
  lastPrice: 10000000,
  lowestPrice: 10000000,
  highestPrice: 10000000,
  SIM: '1234567890123456789',
  SIM2: '1234567890123456780',
  badSIM: '0000000000000000000',
  data: 1000000000,
};

contract('Lava', (accounts) => {
  let contract;
  let web3;

  before(async () => {
    contract = await Lava.deployed();
    web3 = contract.constructor.web3;

    fixture.balance = web3.eth.getBalance(accounts[0]).toNumber();
    fixture.hexSIM = web3.fromAscii(fixture.SIM).padEnd(66, 0);
    fixture.hexSIM2 = web3.fromAscii(fixture.SIM2).padEnd(66, 0);

    return Promise.resolve();
  });

  describe('deploy', () => {
    it('parameters are correct', async () => {
      const owner = await contract.owner();
      const activationFee = await contract.activationFee();
      const minimumBalance = await contract.minimumBalance();
      const etherPerByte = await contract.etherPerByte();
      const lastPrice = await contract.lastPrice();
      const lowestPrice = await contract.lowestPrice();
      const highestPrice = await contract.highestPrice();
      const balance = await contract.balance();

      assert.equal(owner, accounts[0]);
      assert.equal(activationFee.toNumber(), fixture.activationFee);
      assert.equal(minimumBalance.toNumber(), fixture.minimumBalance);
      assert.equal(etherPerByte.toNumber(), fixture.etherPerByte);
      assert.equal(lastPrice.toNumber(), fixture.lastPrice);
      assert.equal(lowestPrice.toNumber(), fixture.lowestPrice);
      assert.equal(highestPrice.toNumber(), fixture.highestPrice);
      assert.equal(balance.toNumber(), 0);

      return Promise.resolve();
    });

    it('should fail trying to send eth directly to contract', async () => {
      let error;

      try {
        await web3.eth.sendTransaction({
          from: accounts[0],
          to: contract.address,
          value: fixture.minimumBalance,
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

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
      let error;

      try {
        await contract.getUser({
          from: accounts[1],
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });
  });

  describe('register', () => {
    it('should fail if amount is less than fees', async () => {
      let error;

      try {
        await contract.register(fixture.hexSIM, {
          from: accounts[0],
          value: fixture.minimumBalance,
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should register new user and new SIM', async () => {
      await contract.register(fixture.hexSIM, {
        from: accounts[0],
        value: fixture.minimumBalance + fixture.activationFee,
      });

      await (() => {
        const activateSIM = contract.LogActivateSIM();

        activateSIM.watch((error, event) => {
          activateSIM.stopWatching();

          assert.equal(event.args.user, accounts[0]);
          assert.equal(event.args.sim, fixture.hexSIM);
        });
      })();

      const isUser = await contract.isUser(accounts[0]);
      const isSIM = await contract.isSIM(fixture.hexSIM);
      const isUserSIM = await contract.isUserSIM(accounts[0], fixture.hexSIM);
      const user = await contract.getUser({
        from: accounts[0],
      });
      const SIM = await contract.getSIM(fixture.hexSIM);
      const balance = await contract.balance();

      const userBalance = user[0].toNumber();
      const userData = user[1].toNumber();
      const userHexSIM = user[2][0];
      const userSIM = web3.toAscii(userHexSIM).replace(/\0/g, '');

      const userAddress = SIM[0];
      const dataPaid = SIM[1].toNumber();
      const dataConsumed = SIM[2].toNumber();
      const isActivated = SIM[3];
      const updateStatus = SIM[4];
      const newBalance = web3.eth.getBalance(accounts[0]).toNumber();

      assert.equal(balance, fixture.activationFee);
      assert.ok(isUser);
      assert.ok(isSIM);
      assert.ok(isUserSIM);
      assert.equal(userBalance, fixture.minimumBalance);
      assert.equal(userData, 0);
      assert.equal(userHexSIM, fixture.hexSIM);
      assert.equal(userSIM, fixture.SIM);
      assert.equal(userAddress, accounts[0]);
      assert.equal(dataPaid, 0);
      assert.equal(dataConsumed, 0);
      assert.ok(!isActivated);
      assert.ok(updateStatus);
      assert.ok(newBalance <= (fixture.balance + fixture.minimumBalance));

      return Promise.resolve();
    });

    it('should fail if trying to register already registered SIM', async () => {
      let error;

      try {
        await contract.register(fixture.hexSIM, {
          from: accounts[0],
          value: fixture.minimumBalance + fixture.activationFee,
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should register new SIM with the same user and extra payment', async () => {
      await contract.register(fixture.hexSIM2, {
        from: accounts[0],
        value: fixture.minimumBalance + fixture.activationFee + fixture.etherPerByte,
      });

      const isSIM = await contract.isSIM(fixture.hexSIM2);
      const isUserSIM = await contract.isUserSIM(accounts[0], fixture.hexSIM2);
      const user = await contract.getUser({
        from: accounts[0],
      });
      const SIM = await contract.getSIM(fixture.hexSIM2);

      const userBalance = user[0].toNumber();
      const userData = user[1].toNumber();
      const userHexSIM = user[2][1];
      const userSIM = web3.toAscii(userHexSIM).replace(/\0/g, '');

      const userAddress = SIM[0];
      const dataPaid = SIM[1].toNumber();
      const dataConsumed = SIM[2].toNumber();
      const isActivated = SIM[3];
      const updateStatus = SIM[4];

      assert.ok(isSIM);
      assert.ok(isUserSIM);
      assert.equal(userBalance, (fixture.minimumBalance * 2));
      assert.equal(userData, 1);
      assert.equal(userHexSIM, fixture.hexSIM2);
      assert.equal(userSIM, fixture.SIM2);
      assert.equal(userAddress, accounts[0]);
      assert.equal(dataPaid, 0);
      assert.equal(dataConsumed, 0);
      assert.ok(!isActivated);
      assert.ok(updateStatus);

      return Promise.resolve();
    });
  });

  describe('deposit', () => {
    it('should fail if not user', async () => {
      let error;

      try {
        await contract.deposit({
          from: accounts[1],
          value: fixture.minimumBalance,
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should deposit eth into user account', async () => {
      await contract.deposit({
        from: accounts[0],
        value: fixture.minimumBalance * 2,
      });

      const user = await contract.getUser({
        from: accounts[0],
      });

      const userBalance = user[0].toNumber();

      assert.equal(userBalance, (fixture.minimumBalance * 4));

      return Promise.resolve();
    });
  });

  describe('withdraw', () => {
    it('should fail if not user', async () => {
      let error;

      try {
        await contract.withdraw(fixture.minimumBalance, {
          from: accounts[1],
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should fail if withdraw amount is greater than balance', async () => {
      let error;

      try {
        await contract.withdraw(fixture.minimumBalance * 5);
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should withdraw eth from user balance', async () => {
      await contract.withdraw(fixture.minimumBalance);

      const user = await contract.getUser({
        from: accounts[0],
      });

      const userBalance = user[0].toNumber();

      assert.equal(userBalance, (fixture.minimumBalance * 3));

      return Promise.resolve();
    });
  });

  describe('updateSIMStatus', () => {
    it('should fail if not owner', async () => {
      let error;

      try {
        await contract.updateSIMStatus(fixture.hexSIM, {
          from: accounts[1],
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should fail if not a registered SIM', async () => {
      let error;

      try {
        await contract.updateSIMStatus(fixture.badSIM);
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should update SIM status if pending update', async () => {
      const oldSIM = await contract.getSIM(fixture.hexSIM);
      const oldIsActivated = oldSIM[3];
      const oldUpdateStatus = oldSIM[4];

      await contract.updateSIMStatus(fixture.hexSIM);

      const SIM = await contract.getSIM(fixture.hexSIM);
      const isActivated = SIM[3];
      const updateStatus = SIM[4];

      assert.ok(oldIsActivated !== isActivated);
      assert.ok(oldUpdateStatus !== updateStatus);

      return Promise.resolve();
    });

    it('should fail if not pending update', async () => {
      let error;

      try {
        await contract.updateSIMStatus(fixture.hexSIM);
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });
  });

  describe('purchaseData', () => {
    it('should fail if not user', async () => {
      let error;

      try {
        await contract.purchaseData({
          from: accounts[1],
          value: fixture.minimumBalance,
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should fail if value equals 0', async () => {
      let error;

      try {
        await contract.purchaseData({
          from: accounts[0],
          value: 0,
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should purchase data', async () => {
      const userData = (await contract.getUser({
        from: accounts[0],
      }))[1].toNumber();

      const balance = (await contract.balance()).toNumber();
      const purchaseData = fixture.data * fixture.etherPerByte;

      await contract.purchaseData({
        from: accounts[0],
        value: purchaseData,
      });

      const newBalance = (await contract.balance()).toNumber();

      const newUserData = (await contract.getUser({
        from: accounts[0],
      }))[1].toNumber();

      assert.equal(newUserData, userData + fixture.data);
      assert.equal(newBalance, balance + purchaseData);

      return Promise.resolve();
    });
  });

  describe('sellData', () => {
    it('should fail if not user', async () => {
      let error;

      try {
        await contract.sellData(fixture.data, {
          from: accounts[1],
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should fail if data is more that user has', async () => {
      let error;

      try {
        await contract.sellData(10000000000000000000000, {
          from: accounts[0],
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should sell data', async () => {
      const userData = (await contract.getUser({
        from: accounts[0],
      }))[1].toNumber();

      const balance = (await contract.balance()).toNumber();

      await contract.sellData(1, {
        from: accounts[0],
      });

      const newBalance = (await contract.balance()).toNumber();

      const newUserData = (await contract.getUser({
        from: accounts[0],
      }))[1].toNumber();

      assert.equal(newUserData, userData - 1);
      assert.equal(newBalance, balance - fixture.etherPerByte);

      return Promise.resolve();
    });
  });

  describe('collect', () => {
    it('should fail if not owner', async () => {
      let error;

      try {
        await contract.collect(fixture.data, fixture.hexSIM, {
          from: accounts[1],
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should fail if not a registered SIM', async () => {
      let error;

      try {
        await contract.collect(fixture.data, fixture.badSIM);
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should fail if no data consumed', async () => {
      let error;

      try {
        await contract.collect(0, fixture.hexSIM);
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should collect and update user account', async () => {
      await contract.collect(fixture.data, fixture.hexSIM);

      const SIM = await contract.getSIM(fixture.hexSIM);

      const dataPaid = SIM[1].toNumber();
      const dataConsumed = SIM[2].toNumber();
      const updateStatus = SIM[4];

      assert.equal(dataPaid, fixture.data);
      assert.equal(dataConsumed, fixture.data);
      assert.ok(!updateStatus);

      return Promise.resolve();
    });

    it('should set pending status if user balance drops below minimum', async () => {
      const userBalance = (await contract.getUser({
        from: accounts[0],
      }))[0].toNumber();

      const SIMdataPaid = (await contract.getSIM(fixture.hexSIM))[1].toNumber();

      await contract.collect((userBalance / fixture.etherPerByte) + SIMdataPaid, fixture.hexSIM);

      await (() => {
        const deactivateSIM = contract.LogDeactivateSIM();

        deactivateSIM.watch((error, event) => {
          deactivateSIM.stopWatching();

          assert.equal(event.args.user, accounts[0]);
          assert.equal(event.args.sim, fixture.hexSIM);
        });
      })();

      const user = await contract.getUser({
        from: accounts[0],
      });

      const SIM = await contract.getSIM(fixture.hexSIM);

      const balance = user[0].toNumber();
      const data = user[1].toNumber();

      const dataPaid = SIM[1].toNumber();
      const dataConsumed = SIM[2].toNumber();
      const updateStatus = SIM[4];

      assert.equal(balance, 0);
      assert.equal(data, 0);
      assert.equal(dataPaid, dataConsumed);
      assert.ok(updateStatus);

      return Promise.resolve();
    });
  });

  describe('flipSIMStatus', () => {
    it('should fail if not user', async () => {
      let error;

      try {
        await contract.flipSIMStatus(fixture.hexSIM, {
          from: accounts[1],
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should fail if not user SIM', async () => {
      let error;

      try {
        await contract.flipSIMStatus(fixture.badSIM, {
          from: accounts[0],
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should fail if pending update', async () => {
      let error;

      try {
        await contract.flipSIMStatus(fixture.hexSIM);
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should fail to flip to activate if balance less than minimum', async () => {
      let error;

      await contract.updateSIMStatus(fixture.hexSIM);

      try {
        await contract.flipSIMStatus(fixture.hexSIM);
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should flip SIM status', async () => {
      const oldSIM = await contract.getSIM(fixture.hexSIM);
      const dataOwed = (oldSIM[2].toNumber() - oldSIM[1].toNumber());

      await contract.deposit({
        from: accounts[0],
        value: (dataOwed * fixture.etherPerByte) + fixture.minimumBalance,
      });

      await contract.flipSIMStatus(fixture.hexSIM);

      await (() => {
        const activateSIM = contract.LogActivateSIM();

        activateSIM.watch((error, event) => {
          activateSIM.stopWatching();

          assert.equal(event.args.user, accounts[0]);
          assert.equal(event.args.sim, fixture.hexSIM);
        });
      })();

      const SIM = await contract.getSIM(fixture.hexSIM);
      const isActivated = SIM[3];
      const updateStatus = SIM[4];

      assert.ok(!isActivated);
      assert.ok(updateStatus);

      await contract.updateSIMStatus(fixture.hexSIM);

      await contract.flipSIMStatus(fixture.hexSIM);

      await (() => {
        const deactivateSIM = contract.LogDeactivateSIM();

        deactivateSIM.watch((error, event) => {
          deactivateSIM.stopWatching();

          assert.equal(event.args.user, accounts[0]);
          assert.equal(event.args.sim, fixture.hexSIM);
        });
      })();

      const newSIM = await contract.getSIM(fixture.hexSIM);
      const newIsActivated = newSIM[3];
      const newUpdateStatus = newSIM[4];

      assert.ok(newIsActivated);
      assert.ok(newUpdateStatus);

      return Promise.resolve();
    });
  });
});
