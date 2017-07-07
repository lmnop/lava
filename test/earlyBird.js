/* global artifacts, assert, contract */

const EarlyBird = artifacts.require('./EarlyBird.sol');

const fixture = {
  stakeAmount: 10000000000000000,
};

contract('EarlyBird', (accounts) => {
  let contract;
  let web3;

  before(async () => {
    contract = await EarlyBird.deployed();
    web3 = contract.constructor.web3;

    fixture.balance = web3.eth.getBalance(accounts[0]).toNumber();

    return Promise.resolve();
  });

  describe('Deploy', () => {
    it('parameters are correct', async () => {
      const owner = await contract.owner();
      const isLocked = await contract.isLocked();
      const stakeAmount = await contract.STAKE_AMOUNT();

      assert.equal(owner, accounts[0]);
      assert.equal(isLocked, false);
      assert.equal(stakeAmount.toNumber(), fixture.stakeAmount);

      return Promise.resolve();
    });
  });

  describe('IsStaker', () => {
    it('should return false if not a staker', async () => {
      const isStaker = await contract.isStaker(accounts[0]);

      assert.equal(isStaker, false);

      return Promise.resolve();
    });
  });

  describe('Stake', () => {
    it('should fail if value not equal to stake amount', async () => {
      let error;

      try {
        await contract.stake({
          from: accounts[0],
          value: 20000000000000000,
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should create new staker', async () => {
      await contract.stake({
        from: accounts[0],
        value: fixture.stakeAmount,
      });

      const isStaker = await contract.isStaker(accounts[0]);
      const staker = await contract.getStaker();

      const amount = staker[0].toNumber();
      const blockNumber = staker[1].toNumber();
      const balance = web3.eth.getBalance(accounts[0]);

      fixture.blockNumber = blockNumber;

      assert.ok(isStaker);
      assert.equal(amount, fixture.stakeAmount);
      assert.ok(blockNumber);
      assert.ok(balance < fixture.balance);

      return Promise.resolve();
    });

    it('should fail if already staked', async () => {
      let error;

      try {
        await contract.stake({
          from: accounts[0],
          value: fixture.stakeAmount,
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });
  });

  describe('RefundStake', () => {
    it('should fail if never staked', async () => {
      let error;

      try {
        await contract.refundStake.call({
          from: accounts[1],
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should refund if staked', async () => {
      await contract.refundStake();

      const staker = await contract.getStaker();

      const amount = staker[0].toNumber();
      const blockNumber = staker[1].toNumber();

      assert.equal(amount, 0);
      assert.equal(blockNumber, fixture.blockNumber);

      return Promise.resolve();
    });

    it('can stake again after with higher blocknumber', async () => {
      await contract.stake({
        from: accounts[0],
        value: fixture.stakeAmount,
      });

      const isStaker = await contract.isStaker(accounts[0]);
      const staker = await contract.getStaker();

      const amount = staker[0].toNumber();
      const blockNumber = staker[1].toNumber();

      assert.ok(isStaker);
      assert.equal(amount, fixture.stakeAmount);
      assert.ok(fixture.blockNumber < blockNumber);

      return Promise.resolve();
    });
  });

  describe('LockEarlyBird', () => {
    it('should not lock if not owner', async () => {
      let error;

      try {
        await contract.lockEarlyBird.call({
          from: accounts[1],
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should lock contract', async () => {
      await contract.lockEarlyBird();

      const isLocked = await contract.isLocked();

      assert.equal(isLocked, true);

      return Promise.resolve();
    });

    it('should not allow new stakers', async () => {
      let error;

      try {
        await contract.stake({
          from: accounts[1],
          value: fixture.stakeAmount,
        });
      } catch (err) {
        error = err;
      }

      assert.ok(error);

      return Promise.resolve();
    });

    it('should allow refunds', async () => {
      await contract.refundStake();

      const staker = await contract.getStaker();

      const amount = staker[0].toNumber();

      assert.equal(amount, 0);

      return Promise.resolve();
    });
  });
});
