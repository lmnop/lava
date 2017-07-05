pragma solidity ^0.4.11;

import './Ownable.sol';
import './HasUsers.sol';
import './SafeMath.sol';


contract Lava is Ownable, HasUsers {
    using SafeMath for uint256;

    uint public minimumBalance;                         // minimum balance to keep SIMs activated
    uint public dataCost;                               // cost per byte in wei

    event LogRegisterSIM(
        address user,
        string sim,
    );

    event LogDepositMade(
        address user,
        uint amount,
    );

    event LogWithdrawlMade(
        address user,
        uint amount,
    );

    event LogActivateSIM(
        address user,
        string sim,
    );

    event LogDeactivateSIM(
        address user,
        string sim,
    );

    event LogCollectionMade(
        address user,
        string sim,
        uint amount,
    );

    function Lava() {
        minimumBalance = 0.04 ether;
        dataCost = 40000000;
    }

    function register(string sim) public payable {
        require(msg.value >= minimumBalance);
        require(!isSIM(sim));

        if (!isUser(msg.sender)) {
            users[msg.sender] = User({
                index: userList.push(msg.sender) - 1,
                balance: msg.value,
            });
        }

        sims[sim] = SIM({
            index: simList.push(sim) - 1,
            userIndex: users[msg.sender].sims.push(sim) - 1,
            user: msg.sender,
            dataPaid: 0,
            dataConsumed: 0,
            isActivated: false,
            updateStatus: true,
        });

        users[msg.sender].sims.push(sim);

        LogRegisterSIM(msg.sender, sim);
        LogActivateSIM(msg.sender, sim);
        LogDepositMade(msg.sender, msg.value);
    }

    function deposit() public payable senderMustBeUser {
        uint initialBalance = users[msg.sender].balance;
        uint newBalance = initialBalance + msg.value;

        require(newBalance >= minimumBalance);

        users[msg.sender].balance = newBalance;

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

    function activateSIM(string sim) public senderMustBeUser {
        require(isUserSIM(msg.sender, sim));
        require(!sims[sim].updateStatus);
        require(!sims[sim].isActivated);
        require(users[msg.sender].balance >= minimumBalance);

        sims[sim].updateStatus = true;

        LogActivateSIM(msg.sender, sim);
    }

    function deactivateSIM(string sim) public senderMustBeUser {
        require(isUserSIM(msg.sender, sim));
        require(!sims[sim].updateStatus);
        require(sims[sim].isActivated);

        sims[sim].updateStatus = true;

        LogDeactivateSIM(msg.sender, sim);
    }

    function collect(int dataConsumed, string sim) public onlyOwner {
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

    function updateSIMStatus(string sim) public onlyOwner mustBeSIM {
        require(sims[sim].updateStatus);

        sims[sim].isActivated = !sims[sim].isActivated;
        sims[sim].updateStatus = false;
    }

    function getSIMs() public constant onlyOwner returns (string[] sims) {
        return sims;
    }

}
