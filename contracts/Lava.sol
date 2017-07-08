pragma solidity ^0.4.11;

import './Ownable.sol';
import './HasUsers.sol';


contract Lava is Ownable, HasUsers {
    uint public minimumBalance;                         // minimum balance to keep SIMs activated
    uint public dataCost;                               // cost per byte in wei

    event LogRegisterSIM(address user, bytes32 sim);
    event LogDepositMade(address user, uint amount);
    event LogWithdrawlMade(address user, uint amount);
    event LogActivateSIM(address user, bytes32 sim);
    event LogDeactivateSIM(address user, bytes32 sim);
    event LogCollectionMade(address user, bytes32 sim, uint amount);

    function Lava() {
        minimumBalance = 0.04 ether;
        dataCost = 40000000;
    }

    function register(bytes32 sim) public payable {
        require(msg.value >= minimumBalance);
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

        LogRegisterSIM(msg.sender, sim);
        LogActivateSIM(msg.sender, sim);
        LogDepositMade(msg.sender, msg.value);
    }

    function deposit() public payable senderMustBeUser {
        require(msg.value >= minimumBalance);

        users[msg.sender].balance += msg.value;

        LogDepositMade(msg.sender, msg.value);
    }

    function withdraw(uint withdrawAmount) public senderMustBeUser {
        require(withdrawAmount <= users[msg.sender].balance);

        users[msg.sender].balance -= withdrawAmount;

        if (!msg.sender.send(withdrawAmount)) {
            users[msg.sender].balance += withdrawAmount;
        } else {
            LogWithdrawlMade(msg.sender, withdrawAmount);
        }
    }

    function activateSIM(bytes32 sim) public senderMustBeUser {
        require(isUserSIM(msg.sender, sim));
        require(!sims[sim].updateStatus);
        require(!sims[sim].isActivated);
        require(users[msg.sender].balance >= minimumBalance);

        sims[sim].updateStatus = true;

        LogActivateSIM(msg.sender, sim);
    }

    function deactivateSIM(bytes32 sim) public senderMustBeUser {
        require(isUserSIM(msg.sender, sim));
        require(!sims[sim].updateStatus);
        require(sims[sim].isActivated);

        sims[sim].updateStatus = true;

        LogDeactivateSIM(msg.sender, sim);
    }

    function collect(int dataConsumed, bytes32 sim) public onlyOwner {
        require(isSIM(sim));

        SIM userSIM = sims[sim];
        User user = users[userSIM.user];

        require(user.balance > 0);

        int dataPaid = userSIM.dataPaid;
        int newDataPaid = dataConsumed;

        uint payableAmount = uint(dataConsumed - dataPaid) * dataCost;

        // If balance can't cover payable
        // empty balance to cover what it can
        // update dataPaid to reflect what's been paid for
        if (user.balance < payableAmount) {
            payableAmount = user.balance;
            newDataPaid = dataPaid + int(payableAmount / dataCost);
        }

        user.balance -= payableAmount;
        userSIM.dataPaid = newDataPaid;
        userSIM.dataConsumed = dataConsumed;
        userSIM.lastCollection = block.timestamp;

        balance += payableAmount;

        LogCollectionMade(userSIM.user, sim, payableAmount);

        // Need to deactivate SIM if the user balance
        // drops below minimumBalance
        if (user.balance < minimumBalance) {
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
