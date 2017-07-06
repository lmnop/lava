pragma solidity ^0.4.11;

import './HasSIMs.sol';


contract HasUsers is HasSIMs {

    struct User {
        uint index;
        uint balance;
        bytes32[] sims;
    }

    mapping (address => User) users;
    address[] userList;

    modifier senderMustBeUser() {
        require(isUser(msg.sender));

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

    function getUser() public constant senderMustBeUser returns (uint balance, bytes32[] sims) {
        return (users[msg.sender].balance, users[msg.sender].sims);
    }

}
