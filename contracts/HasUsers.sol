pragma solidity ^0.4.11;

import './HasSIMs.sol';


contract HasUsers is HasSIMs {

    struct User {
        uint index;
        uint balance;
        bytes19[] sims;
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

    function isUserSIM(address user, bytes19 sim) public constant returns (bool) {
        require(isUser(user));
        require(isSIM(sim));

        return sims[sim].user == user;
    }

    function getUser() public constant senderMustBeUser returns (uint balance, bytes19[] sims) {
        return (users[msg.sender].balance, users[msg.sender].sims);
    }

}
