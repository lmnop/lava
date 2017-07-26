pragma solidity ^0.4.11;


contract Ownable {

    address public owner;
    uint public balance;

    function Ownable() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);

        _;
    }

    function transferOwnership(address newOwner) onlyOwner {
        if (newOwner != address(0)) {
            owner = newOwner;
        }
    }

    function withdrawBalance(uint withdrawAmount) public onlyOwner {
        require(withdrawAmount <= balance);

        balance -= withdrawAmount;

        if (!msg.sender.send(withdrawAmount)) {
            balance += withdrawAmount;
        }
    }

    function () {
        revert();
    }

}
