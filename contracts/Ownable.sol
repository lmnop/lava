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

    function emptyBalance() public onlyOwner {
        require(balance > 0);

        uint oldBalance = balance;
        balance = 0;

        if (!msg.sender.send(oldBalance)) {
            balance = oldBalance;
        }
    }

    function () {
        throw;
    }

}
