/* global artifacts, assert, contract */

const PreOrderLava = artifacts.require('./PreOrderLava.sol');

const fixture = {
  rinkebyAddress: '0x1000000000000000000000000000000000000000000000000000000000000000',
};

contract('PreOrderLava', (accounts) => {
  let contract;
  let web3;

  before(async () => {
    contract = await PreOrderLava.deployed();
    web3 = contract.constructor.web3;

    fixture.balance = web3.eth.getBalance(accounts[0]).toNumber();

    return Promise.resolve();
  });

  describe('Deploy', () => {
    it('parameters are correct', async () => {
      const owner = await contract.owner();

      assert.equal(owner, accounts[0]);

      return Promise.resolve();
    });
  });

  describe('IsUser', () => {
    it('should return false if not a user', async () => {
      const isUser = await contract.isUser(accounts[0]);

      assert.equal(isUser, false);

      return Promise.resolve();
    });
  });

  describe('preOrder', () => {
    it('should create user', async () => {
      await contract.preOrder();

      const user = await contract.getUser();

      const blockNumber = user[0].toNumber();
      const processing = user[1];
      const shipping = user[2];
      const complete = user[3];
      const isBetaUser = user[4];

      assert.ok(blockNumber);
      assert.ok(!processing);
      assert.ok(!shipping);
      assert.ok(!complete);
      assert.ok(!isBetaUser);

      fixture.blockNumber = blockNumber;

      return Promise.resolve();
    });

    it('should fail if already a user', async () => {
      let error;

      try {
        await contract.preOrder();
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });
  });

  describe('processing', () => {
    it('should fail if not owner', async () => {
      let error;

      try {
        await contract.processing(accounts[0], {
          from: accounts[1],
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should fail if not user', async () => {
      let error;

      try {
        await contract.processing(accounts[1]);
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should update processing', async () => {
      await contract.processing(accounts[0]);

      const user = await contract.getUser({
        from: accounts[0],
      });

      const blockNumber = user[0].toNumber();
      const processing = user[1];
      const shipping = user[2];
      const complete = user[3];
      const isBetaUser = user[4];

      assert.ok(blockNumber > fixture.blockNumber);
      assert.ok(processing);
      assert.ok(!shipping);
      assert.ok(!complete);
      assert.ok(!isBetaUser);

      fixture.blockNumber = blockNumber;

      return Promise.resolve();
    });

    it('should fail if already processed', async () => {
      let error;

      try {
        await contract.processing(accounts[0]);
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });
  });

  describe('shipping', () => {
    it('should fail if not owner', async () => {
      let error;

      try {
        await contract.shipping(accounts[0], {
          from: accounts[1],
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should fail if not user', async () => {
      let error;

      try {
        await contract.shipping(accounts[1]);
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should update shipping', async () => {
      await contract.shipping(accounts[0]);

      const user = await contract.getUser({
        from: accounts[0],
      });

      const blockNumber = user[0].toNumber();
      const processing = user[1];
      const shipping = user[2];
      const complete = user[3];
      const isBetaUser = user[4];

      assert.ok(blockNumber > fixture.blockNumber);
      assert.ok(processing);
      assert.ok(shipping);
      assert.ok(!complete);
      assert.ok(!isBetaUser);

      fixture.blockNumber = blockNumber;

      return Promise.resolve();
    });

    it('should fail if already shipping', async () => {
      let error;

      try {
        await contract.shipping(accounts[0]);
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });
  });

  describe('complete', () => {
    it('should fail if not user', async () => {
      let error;

      try {
        await contract.shipping({
          from: accounts[1],
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should update complete', async () => {
      await contract.complete();

      const user = await contract.getUser();

      const blockNumber = user[0].toNumber();
      const processing = user[1];
      const shipping = user[2];
      const complete = user[3];
      const isBetaUser = user[4];

      assert.ok(blockNumber > fixture.blockNumber);
      assert.ok(processing);
      assert.ok(shipping);
      assert.ok(complete);
      assert.ok(!isBetaUser);

      fixture.blockNumber = blockNumber;

      return Promise.resolve();
    });

    it('should fail if already complete', async () => {
      let error;

      try {
        await contract.complete();
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });
  });

  describe('betaUser', () => {
    it('should fail if not owner', async () => {
      let error;

      try {
        await contract.betaUser(accounts[0], fixture.rinkebyAddress, {
          from: accounts[1],
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should fail if not user', async () => {
      let error;

      try {
        await contract.betaUser(accounts[1], fixture.rinkebyAddress);
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should update shipping', async () => {
      await contract.betaUser(accounts[0], fixture.rinkebyAddress);

      const user = await contract.getUser({
        from: accounts[0],
      });

      const blockNumber = user[0].toNumber();
      const processing = user[1];
      const shipping = user[2];
      const complete = user[3];
      const isBetaUser = user[4];
      const rinkebyAddress = user[5];

      assert.ok(blockNumber > fixture.blockNumber);
      assert.ok(processing);
      assert.ok(shipping);
      assert.ok(complete);
      assert.ok(isBetaUser);
      assert.equal(rinkebyAddress, fixture.rinkebyAddress);

      fixture.blockNumber = blockNumber;

      return Promise.resolve();
    });
  });
});
