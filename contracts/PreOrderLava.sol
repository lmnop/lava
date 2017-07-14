pragma solidity ^0.4.11;

import './Ownable.sol';


contract PreOrderLava is Ownable {

    struct User {
        uint index;
        bool processing;
        bool shipping;
        bool complete;
        uint blockNumber;
        bool isBetaUser;
        bytes32 rinkebyAddress;
    }

    mapping(address => User) public users;
    address[] public userList;

    modifier mustBeUser() {
        require(isUser(msg.sender));

        _;
    }

    function isUser(address user) public constant returns (bool) {
        if (userList.length == 0) {
            return false;
        }

        return userList[users[user].index] == user;
    }

    function getUser() public constant mustBeUser returns (uint blockNumber, bool processing, bool shipping, bool complete, bool isBetaUser, bytes32 rinkebyAddress) {
        User user = users[msg.sender];
        return (user.blockNumber, user.processing, user.shipping, user.complete, user.isBetaUser, user.rinkebyAddress);
    }

    function preOrder() public {
        require(!isUser(msg.sender));

        users[msg.sender].index = userList.push(msg.sender) - 1;
        users[msg.sender].blockNumber = block.number;
    }

    function processing(address user) public onlyOwner {
        require(isUser(user));
        require(!users[user].processing);
        require(!users[user].shipping);
        require(!users[user].complete);

        users[user].processing = true;
        users[user].blockNumber = block.number;
    }

    function shipping(address user) public onlyOwner {
        require(isUser(user));
        require(users[user].processing);
        require(!users[user].shipping);
        require(!users[user].complete);

        users[user].shipping = true;
        users[user].blockNumber = block.number;
    }

    function complete() public mustBeUser {
        require(users[msg.sender].processing);
        require(users[msg.sender].shipping);
        require(!users[msg.sender].complete);

        users[msg.sender].complete = true;
        users[msg.sender].blockNumber = block.number;
    }

    function betaUser(address user, bytes32 rinkebyAddress) public onlyOwner {
        require(isUser(user));
        require(users[user].processing);
        require(users[user].shipping);
        require(users[user].complete);
        require(!users[user].isBetaUser);

        users[user].isBetaUser = true;
        users[user].rinkebyAddress = rinkebyAddress;
        users[user].blockNumber = block.number;
    }

}
