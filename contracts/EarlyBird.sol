pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract EarlyBird is Ownable {

  uint public stakeAmount;
  bool public isLocked;

  struct Staker {
    uint index;
    uint amount;
    uint blockNumber;
  }

  mapping(address => Staker) public stakers;
  address[] public stakersList;

  event StakeCompleted(address staker, uint blockNumber);
  event StakeRefunded(address staker);

  function EarlyBird(int amount) {
    stakeAmount = uint(amount);
    isLocked = false;
  }

  function isStaker(address staker) public constant returns (bool) {
    if (stakersList.length == 0) return false;
    return stakersList[stakers[staker].index] == staker;
  }

  function getStaker() public constant returns (uint amount, uint blockNumber) {
    return (stakers[msg.sender].amount, stakers[msg.sender].blockNumber);
  }

  function stake() public payable {
    if (isLocked) throw;
    if (msg.value != stakeAmount) throw;

    if (!isStaker(msg.sender)) {
      stakers[msg.sender] = Staker({
        index: stakersList.push(msg.sender) -1,
        amount: msg.value,
        blockNumber: block.number,
      });
    } else if (stakers[msg.sender].amount == 0) {
      stakers[msg.sender].amount = msg.value;
      stakers[msg.sender].blockNumber = block.number;
    } else {
      throw;
    }

    StakeCompleted(msg.sender, block.number);
  }

  function refundStake() public {
    if (!isStaker(msg.sender)) throw;
    if (stakers[msg.sender].amount == 0) throw;

    uint refund = stakers[msg.sender].amount;
    stakers[msg.sender].amount = 0;

    if (!msg.sender.send(refund)) {
      stakers[msg.sender].amount += refund;
    } else {
      StakeRefunded(msg.sender);
    }
  }

  function lockEarlyBird() public onlyOwner {
    isLocked = true;
  }

  function () {
    throw;
  }

}
