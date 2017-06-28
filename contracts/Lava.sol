pragma solidity ^0.4.11;

import './Ownable.sol';


contract Lava is Ownable {

    uint public minimumBalance;
    uint public dataCost;

    struct User {
        uint index;
        uint balance;
        string sim;
        int dataPaid;
        int dataConsumed;
        uint lastCollection;
    }

    mapping (address => User) private users;
    mapping (string => address) private sims;
    address[] private usersList;

    event ActivateSIM(address user, string sim);
    event DeactivateSIM(address user, string sim);
    event DepositMade(address user, string sim, uint amount);
    event WithdrawMade(address user, string sim, uint amount);
    event CollectionMade(address user, string sim, uint amount);

    function Lava() {
        minimumBalance = 0.04 ether;
        dataCost = 40000000;
    }

    function isUser(address user) public constant returns (bool) {
        if (usersList.length == 0) {
            return false;
        }

        return usersList[users[user].index] == user;
    }

    function getUser() public constant returns (uint balance, string sim, int dataPaid, int dataConsumed) {
        User user = users[msg.sender];
        return (user.balance, user.sim, user.dataPaid, user.dataConsumed);
    }

    function register(string sim) public payable {
        require(msg.value >= minimumBalance);
        require(!isUser(msg.sender));

        users[msg.sender] = User({
            index: usersList.push(msg.sender) - 1,
            balance: msg.value,
            sim: sim,
            dataPaid: 0,
            dataConsumed: 0,
        });

        sims[sim] = msg.sender;

        ActivateSIM(msg.sender, sim);
    }

    function deposit() public payable {
        require(isUser(msg.sender));

        uint initialBalance = users[msg.sender].balance;
        uint newBalance = initialBalance + msg.value;

        require(newBalance >= minimumBalance);

        users[msg.sender].balance = newBalance;

        DepositMade(msg.sender, users[msg.sender].sim, msg.value);

        if (initialBalance < minimumBalance) {
            ActivateSIM(msg.sender, users[msg.sender].sim);
        }
    }

    function withdraw(uint withdrawAmount) public {
        require(isUser(msg.sender));

        if (users[msg.sender].balance >= withdrawAmount) {
            users[msg.sender].balance -= withdrawAmount;

            if (!msg.sender.send(withdrawAmount)) {
                users[msg.sender].balance += withdrawAmount;
            } else {
                WithdrawMade(msg.sender, users[msg.sender].sim, withdrawAmount);
            }
        }

        if (users[msg.sender].balance < minimumBalance) {
            DeactivateSIM(msg.sender, users[msg.sender].sim);
        }
    }

    function collect(int dataConsumed, string sim) public onlyOwner {
        address user = sims[sim];

        require(isUser(user));
        require(users[user].balance > 0);

        int dataPaid = users[user].dataPaid;
        int oldDataConsumed = users[user].dataConsumed;

        uint payableAmount = uint(dataConsumed - dataPaid) * dataCost;

        // If balance can't cover payable
        // empty balance to cover what it can
        // update dataPaid to reflect what's been paid for
        if (users[user].balance < payableAmount) {
            payableAmount = users[user].balance;
            dataConsumed = dataPaid + int(payableAmount / dataCost);
        }

        users[user].balance -= payableAmount;
        users[user].dataPaid = dataConsumed;
        users[user].dataConsumed = dataConsumed;

        if (!msg.sender.send(payableAmount)) {
            users[user].balance += payableAmount;
            users[user].dataPaid = dataPaid;
            users[user].dataConsumed = oldDataConsumed;
        } else {
            CollectionMade(user, sim, payableAmount);
        }

        if (users[user].balance < minimumBalance) {
            DeactivateSIM(user, sim);
        }
    }

}
