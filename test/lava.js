/* global artifacts, assert, contract */

const Lava = artifacts.require('./Lava.sol');

const fixture = {
  minimumBalance: 40000000000000000,
  dataCost: 40000000,
  SIM: '1234567890123456789',
  SIM2: '1234567890123456780',
  badSIM: '0000000000000000000',
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

  describe('Register', () => {
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

  describe('Deposit', () => {
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

  describe('Withdraw', () => {
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

      const user = await contract.getUser.call({
        from: accounts[0],
      });

      const userBalance = user[0].toNumber();

      assert.equal(userBalance, (fixture.minimumBalance * 2));

      return Promise.resolve();
    });
  });
});
