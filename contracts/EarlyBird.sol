pragma solidity ^0.4.11;

import './Ownable.sol';


contract EarlyBird is Ownable {

    uint constant public STAKE_AMOUNT = 10000000000000000;

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

    function EarlyBird() {
        isLocked = false;
    }

    function isStaker(address staker) public constant returns (bool) {
        if (stakersList.length == 0) {
            return false;
        }

        return stakersList[stakers[staker].index] == staker;
    }

    function getStaker() public constant returns (uint amount, uint blockNumber) {
        return (stakers[msg.sender].amount, stakers[msg.sender].blockNumber);
    }

    function stake() public payable {
        require(!isLocked);
        require(msg.value == STAKE_AMOUNT);

        if (!isStaker(msg.sender)) {
            stakers[msg.sender] = Staker(
                {
                    index: stakersList.push(msg.sender) - 1,
                    amount: msg.value,
                    blockNumber: block.number,
                }
            );
        } else if (stakers[msg.sender].amount == 0) {
            stakers[msg.sender].amount = msg.value;
            stakers[msg.sender].blockNumber = block.number;
        } else {
            throw;
        }

        StakeCompleted(msg.sender, block.number);
    }

    function refundStake() public {
        require(isStaker(msg.sender));

        uint refund = stakers[msg.sender].amount;

        require(refund >= 0);

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

}
