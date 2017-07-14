pragma solidity ^0.4.11;

import './Ownable.sol';
import './HasUsers.sol';


contract Lava is Ownable, HasUsers {
    uint constant public MINIMUM_BALANCE = 0.04 ether;      // minimum balance to keep SIMs activated
    uint constant public DATA_COST = 40000000;              // cost per byte in wei

    event LogDepositMade(address user, uint amount);
    event LogWithdrawMade(address user, uint amount);
    event LogActivateSIM(address user, bytes32 sim);
    event LogDeactivateSIM(address user, bytes32 sim);
    event LogCollectionMade(address user, bytes32 sim, uint amount);

    function register(bytes32 sim) public payable {
        require(msg.value >= MINIMUM_BALANCE);
        require(!isSIM(sim));

        if (!isUser(msg.sender)) {
            users[msg.sender].index = userList.push(msg.sender) - 1;
        }

        users[msg.sender].balance += msg.value;

        sims[sim] = SIM(
            {
                index: simList.push(sim) - 1,
                userIndex: users[msg.sender].sims.push(sim) - 1,
                user: msg.sender,
                dataPaid: 0,
                dataConsumed: 0,
                lastCollection: 0,
                isActivated: false,
                updateStatus: true
            }
        );

        LogActivateSIM(msg.sender, sim);
        LogDepositMade(msg.sender, msg.value);
    }

    function deposit() public payable senderMustBeUser {
        require(msg.value >= MINIMUM_BALANCE);

        users[msg.sender].balance += msg.value;

        LogDepositMade(msg.sender, msg.value);
    }

    function withdraw(uint withdrawAmount) public senderMustBeUser {
        require(withdrawAmount <= users[msg.sender].balance);

        users[msg.sender].balance -= withdrawAmount;

        if (!msg.sender.send(withdrawAmount)) {
            users[msg.sender].balance += withdrawAmount;
        } else {
            LogWithdrawMade(msg.sender, withdrawAmount);
        }
    }

    function flipSIMStatus(bytes32 sim) public mustBeSenderSIM(sim) {
        require(!sims[sim].updateStatus);

        if (!sims[sim].isActivated) {
            require(users[msg.sender].balance >= MINIMUM_BALANCE);

            LogActivateSIM(msg.sender, sim);
        } else {
            LogDeactivateSIM(msg.sender, sim);
        }

        sims[sim].updateStatus = true;
    }

    function collect(int dataConsumed, bytes32 sim) public onlyOwner mustBeSIM(sim) {
        require(dataConsumed > 0);

        SIM userSIM = sims[sim];
        User user = users[userSIM.user];

        int dataPaid = userSIM.dataPaid;
        int newDataPaid = dataConsumed;

        uint payableAmount = uint(dataConsumed - dataPaid) * DATA_COST;

        require(payableAmount > 0);

        // If balance can't cover payable
        // empty balance to cover what it can
        // update dataPaid to reflect what's been paid for
        if (user.balance < payableAmount) {
            payableAmount = user.balance;
            newDataPaid = dataPaid + int(payableAmount / DATA_COST);
        }

        user.balance -= payableAmount;
        userSIM.dataPaid = newDataPaid;
        userSIM.dataConsumed = dataConsumed;
        userSIM.lastCollection = block.timestamp;

        balance += payableAmount;

        LogCollectionMade(userSIM.user, sim, payableAmount);

        // Need to deactivate SIM if the user balance
        // drops below minimumBalance
        if (user.balance < MINIMUM_BALANCE) {
            if (userSIM.isActivated) {
                userSIM.updateStatus = true;

                LogDeactivateSIM(userSIM.user, sim);
            }
        }
    }

    function updateSIMStatus(bytes32 sim) public onlyOwner mustBeSIM(sim) {
        require(sims[sim].updateStatus);

        sims[sim].isActivated = !sims[sim].isActivated;
        sims[sim].updateStatus = false;
    }

}
