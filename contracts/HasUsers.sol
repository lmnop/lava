pragma solidity ^0.4.11;

import './HasSIMs.sol';


contract HasUsers is HasSIMs {

    struct User {
        uint index;
        uint balance;       // refundable amount for the user
        int data;           // amount of data in bytes available 
        bytes32[] sims;     // registered SIMs the user owns
    }

    mapping (address => User) users;
    address[] userList;

    modifier senderMustBeUser() {
        require(isUser(msg.sender));

        _;
    }

    modifier mustBeSenderSIM(bytes32 sim) {
        require(isUserSIM(msg.sender, sim));

        _;
    }

    function isUser(address user) public constant returns (bool) {
        if (userList.length == 0) {
            return false;
        }

        return userList[users[user].index] == user;
    }

    function isUserSIM(address user, bytes32 sim) public constant returns (bool) {
        if (!isUser(user)) {
            return false;
        }

        if (!isSIM(sim)) {
            return false;
        }

        return sims[sim].user == user;
    }

    function getUser() public constant senderMustBeUser returns (uint balance, int data, bytes32[] sims) {
        return (users[msg.sender].balance, users[msg.sender].data, users[msg.sender].sims);
    }

    function deposit() public payable senderMustBeUser {
        require(msg.value > 0);

        users[msg.sender].balance += msg.value;
    }

    function withdraw(uint withdrawAmount) public senderMustBeUser {
        require(withdrawAmount > 0);
        require(withdrawAmount <= users[msg.sender].balance);

        users[msg.sender].balance -= withdrawAmount;

        if (!msg.sender.send(withdrawAmount)) {
            users[msg.sender].balance += withdrawAmount;
        }
    }

}
