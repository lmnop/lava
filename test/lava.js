/* global artifacts, assert, contract */

const Lava = artifacts.require('./Lava.sol');

const fixture = {
  minimumBalance: 40000000000000000,
  dataCost: 40000000,
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
      const minimumBalance = await contract.MINIMUM_BALANCE();
      const dataCost = await contract.DATA_COST();

      assert.equal(owner, accounts[0]);
      assert.equal(minimumBalance.toNumber(), fixture.minimumBalance);
      assert.equal(dataCost.toNumber(), fixture.dataCost);

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
        await contract.getUser.call({
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
    it('should fail if amount is less than minimum balance', async () => {
      let error;

      try {
        await contract.register(fixture.hexSIM, {
          from: accounts[0],
          value: 20000000000000000,
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
        value: fixture.minimumBalance,
      });

      await (() => {
        const activateSIM = contract.LogActivateSIM();

        activateSIM.watch((error, event) => {
          activateSIM.stopWatching();

          assert.equal(event.args.user, accounts[0]);
          assert.equal(event.args.sim, fixture.hexSIM);
        });
      })();

      await (() => {
        const depositMade = contract.LogDepositMade();

        depositMade.watch((error, event) => {
          depositMade.stopWatching();

          assert.equal(event.args.user, accounts[0]);
          assert.equal(event.args.amount.toNumber(), fixture.minimumBalance);
        });
      })();

      const isUser = await contract.isUser(accounts[0]);
      const isSIM = await contract.isSIM(fixture.hexSIM);
      const isUserSIM = await contract.isUserSIM(accounts[0], fixture.hexSIM);
      const user = await contract.getUser.call({
        from: accounts[0],
      });
      const SIM = await contract.getSIM(fixture.hexSIM);

      const userBalance = user[0].toNumber();
      const userHexSIM = user[1][0];
      const userSIM = web3.toAscii(userHexSIM).replace(/\0/g, '');

      const userAddress = SIM[0];
      const dataPaid = SIM[1].toNumber();
      const dataConsumed = SIM[2].toNumber();
      const lastCollection = SIM[3].toNumber();
      const isActivated = SIM[4];
      const updateStatus = SIM[5];
      const newBalance = web3.eth.getBalance(accounts[0]).toNumber();

      assert.ok(isUser);
      assert.ok(isSIM);
      assert.ok(isUserSIM);
      assert.equal(userBalance, fixture.minimumBalance);
      assert.equal(userHexSIM, fixture.hexSIM);
      assert.equal(userSIM, fixture.SIM);
      assert.equal(userAddress, accounts[0]);
      assert.equal(dataPaid, 0);
      assert.equal(dataConsumed, 0);
      assert.equal(lastCollection, 0);
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
          value: fixture.minimumBalance,
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should register new SIM with the same user', async () => {
      await contract.register(fixture.hexSIM2, {
        from: accounts[0],
        value: fixture.minimumBalance,
      });

      const isSIM = await contract.isSIM(fixture.hexSIM2);
      const isUserSIM = await contract.isUserSIM(accounts[0], fixture.hexSIM2);
      const user = await contract.getUser.call({
        from: accounts[0],
      });
      const SIM = await contract.getSIM(fixture.hexSIM2);

      const userBalance = user[0].toNumber();
      const userHexSIM = user[1][1];
      const userSIM = web3.toAscii(userHexSIM).replace(/\0/g, '');

      const userAddress = SIM[0];
      const dataPaid = SIM[1].toNumber();
      const dataConsumed = SIM[2].toNumber();
      const lastCollection = SIM[3].toNumber();
      const isActivated = SIM[4];
      const updateStatus = SIM[5];
      const newBalance = web3.eth.getBalance(accounts[0]).toNumber();

      assert.ok(isSIM);
      assert.ok(isUserSIM);
      assert.equal(userBalance, (fixture.minimumBalance * 2));
      assert.equal(userHexSIM, fixture.hexSIM2);
      assert.equal(userSIM, fixture.SIM2);
      assert.equal(userAddress, accounts[0]);
      assert.equal(dataPaid, 0);
      assert.equal(dataConsumed, 0);
      assert.equal(lastCollection, 0);
      assert.ok(!isActivated);
      assert.ok(updateStatus);
      assert.ok(newBalance <= (fixture.balance + (fixture.minimumBalance * 2)));

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

    it('should fail if deposit amount is less than minimum balance', async () => {
      let error;

      try {
        await contract.deposit({
          from: accounts[0],
          value: fixture.minimumBalance - 10,
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
        value: fixture.minimumBalance,
      });

      await (() => {
        const depositMade = contract.LogDepositMade();

        depositMade.watch((error, event) => {
          depositMade.stopWatching();

          assert.equal(event.args.user, accounts[0]);
          assert.equal(event.args.amount.toNumber(), fixture.minimumBalance);
        });
      })();

      const user = await contract.getUser.call({
        from: accounts[0],
      });

      const userBalance = user[0].toNumber();
      const newBalance = web3.eth.getBalance(accounts[0]).toNumber();

      assert.equal(userBalance, (fixture.minimumBalance * 3));
      assert.ok(newBalance <= (fixture.balance + (fixture.minimumBalance * 3)));

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
        await contract.withdraw(fixture.minimumBalance * 4);
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should withdraw eth from user balance', async () => {
      await contract.withdraw(fixture.minimumBalance);

      await (() => {
        const withdrawMade = contract.LogWithdrawMade();

        withdrawMade.watch((error, event) => {
          withdrawMade.stopWatching();

          assert.equal(event.args.user, accounts[0]);
          assert.equal(event.args.amount.toNumber(), fixture.minimumBalance);
        });
      })();

      const user = await contract.getUser.call({
        from: accounts[0],
      });

      const userBalance = user[0].toNumber();

      assert.equal(userBalance, (fixture.minimumBalance * 2));

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
      const oldIsActivated = oldSIM[4];
      const oldUpdateStatus = oldSIM[5];

      await contract.updateSIMStatus(fixture.hexSIM);

      const SIM = await contract.getSIM(fixture.hexSIM);
      const isActivated = SIM[4];
      const updateStatus = SIM[5];

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

  describe('collect', () => {
    it('should fail if not owner', async () => {
      let error;

      try {
        await contract.collect(fixture.minimumBalance, fixture.hexSIM, {
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
        await contract.collect(fixture.minimumBalance, fixture.badSIM);
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

    it('should update user account and move eth to main balance', async () => {
      const collection = fixture.data * fixture.dataCost;

      await contract.collect(fixture.data, fixture.hexSIM);

      await (() => {
        const collectionMade = contract.LogCollectionMade();

        collectionMade.watch((error, event) => {
          collectionMade.stopWatching();

          assert.equal(event.args.user, accounts[0]);
          assert.equal(event.args.sim, fixture.hexSIM);
          assert.equal(event.args.amount.toNumber(), collection);
        });
      })();

      const balance = (await contract.balance()).toNumber();

      const user = await contract.getUser.call({
        from: accounts[0],
      });

      const SIM = await contract.getSIM(fixture.hexSIM);

      const userBalance = user[0].toNumber();
      const dataPaid = SIM[1].toNumber();
      const dataConsumed = SIM[2].toNumber();
      const lastCollection = SIM[3].toNumber();
      const updateStatus = SIM[5];

      assert.equal(balance, collection);
      assert.equal(userBalance, (fixture.minimumBalance * 2) - collection);
      assert.equal(dataPaid, fixture.data);
      assert.equal(dataConsumed, fixture.data);
      assert.ok(lastCollection);
      assert.ok(!updateStatus);

      return Promise.resolve();
    });

    it('should set pending status if user balance drops below minimum', async () => {
      const collection = (fixture.data * 2) * fixture.dataCost;

      await contract.collect(fixture.data * 2, fixture.hexSIM);

      const balance = (await contract.balance()).toNumber();

      const user = await contract.getUser.call({
        from: accounts[0],
      });

      const SIM = await contract.getSIM(fixture.hexSIM);

      const userBalance = user[0].toNumber();
      const dataPaid = SIM[1].toNumber();
      const dataConsumed = SIM[2].toNumber();
      const lastCollection = SIM[3].toNumber();
      const updateStatus = SIM[5];

      assert.equal(balance, collection);
      assert.equal(userBalance, 0);
      assert.equal(dataPaid, fixture.data * 2);
      assert.equal(dataConsumed, fixture.data * 2);
      assert.ok(lastCollection);
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
      await contract.deposit({
        from: accounts[0],
        value: fixture.minimumBalance,
      });

      await contract.flipSIMStatus(fixture.hexSIM);

      const SIM = await contract.getSIM(fixture.hexSIM);
      const isActivated = SIM[4];
      const updateStatus = SIM[5];

      assert.ok(!isActivated);
      assert.ok(updateStatus);

      await contract.updateSIMStatus(fixture.hexSIM);

      await contract.flipSIMStatus(fixture.hexSIM);

      const newSIM = await contract.getSIM(fixture.hexSIM);
      const newIsActivated = newSIM[4];
      const newUpdateStatus = newSIM[5];

      assert.ok(newIsActivated);
      assert.ok(newUpdateStatus);

      return Promise.resolve();
    });
  });
});
