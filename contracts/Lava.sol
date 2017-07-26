pragma solidity ^0.4.11;

import './Ownable.sol';
import './HasUsers.sol';
import './DataMath.sol';


contract Lava is Ownable, HasUsers {
    using DataMath for uint;

    uint public activationFee = 0.04 ether; // fee to register & activate SIM
    uint public minimumBalance = 0.04 ether; // balance needed on account to keep SIM active
    uint public etherPerByte = 0.000002 ether; // eth cost per byte of data

    uint public lastPrice = 0.000002 ether; // last etherPerByte price
    uint public lowestPrice = 0.000002 ether; // historically lowest etherPerByte price
    uint public highestPrice = 0.000002 ether; // historically highest etherPerByte price

    event LogActivateSIM(address user, bytes32 sim);
    event LogDeactivateSIM(address user, bytes32 sim);

    modifier greaterThanZero(uint cost) {
        require(cost > 0);

        _;
    }

    function setBounty() public payable onlyOwner greaterThanZero(msg.value) {
        balance += msg.value;
    }

    function setActivationFee(uint cost) public onlyOwner greaterThanZero(cost) {
        activationFee = cost;
    }

    function setMinimumBalance(uint cost) public onlyOwner greaterThanZero(cost) {
        minimumBalance = cost;
    }

    function setEtherPerByte(uint cost) public onlyOwner greaterThanZero(cost) {
        lastPrice = etherPerByte;
        etherPerByte = cost;

        if (cost > highestPrice) {
            highestPrice = cost;
        }

        if (cost < lowestPrice) {
            lowestPrice = cost;
        }
    }

    function updateSIMStatus(bytes32 sim) public onlyOwner mustBeSIM(sim) {
        require(sims[sim].updateStatus);

        sims[sim].isActivated = !sims[sim].isActivated;
        sims[sim].updateStatus = false;
    }

    function collect(int dataConsumed, bytes32 sim) public onlyOwner mustBeSIM(sim) {
        require(dataConsumed > 0);

        SIM userSIM = sims[sim];
        User user = users[userSIM.user];

        int dataPaid = userSIM.dataPaid;
        int newDataPaid = dataConsumed;
        int dataOwed = dataConsumed - dataPaid;

        if (dataOwed > user.data) {
            uint payableAmount = etherPerByte.dataToPayment(dataOwed - user.data);

            if (user.balance < payableAmount) {
                payableAmount = user.balance;
                newDataPaid = dataPaid + etherPerByte.paymentToData(payableAmount);
            }

            user.data = 0;
            user.balance -= payableAmount;
            balance += payableAmount;
        } else {
            user.data -= dataOwed;
        }

        userSIM.dataPaid = newDataPaid;
        userSIM.dataConsumed = dataConsumed;

        if (user.balance < minimumBalance) {
            if (userSIM.isActivated) {
                userSIM.updateStatus = true;

                LogDeactivateSIM(userSIM.user, sim);
            }
        }
    }

    function register(bytes32 sim) public payable {
        uint fees = activationFee.add(minimumBalance);

        require(msg.value >= fees);
        require(!isSIM(sim));

        if (!isUser(msg.sender)) {
            users[msg.sender].index = userList.push(msg.sender) - 1;
        }

        balance += activationFee;
        users[msg.sender].balance += minimumBalance;

        uint extra = msg.value.sub(fees);

        if (extra > 0) {
            users[msg.sender].data += etherPerByte.paymentToData(extra);
            balance += extra;
        }

        sims[sim] = SIM(
            {
                index: simList.push(sim) - 1,
                userIndex: users[msg.sender].sims.push(sim) - 1,
                user: msg.sender,
                dataPaid: 0,
                dataConsumed: 0,
                isActivated: false,
                updateStatus: true
            }
        );

        LogActivateSIM(msg.sender, sim);
    }

    function purchaseData() public payable senderMustBeUser greaterThanZero(msg.value) {
        users[msg.sender].data += etherPerByte.paymentToData(msg.value);
        balance += msg.value;
    }

    function sellData(int dataAmount) public payable senderMustBeUser {
        require(dataAmount <= users[msg.sender].data);

        uint amount = etherPerByte.dataToPayment(dataAmount);

        require(balance > amount);

        users[msg.sender].data -= dataAmount;
        users[msg.sender].balance += amount;
        balance -= amount;
    }

    function flipSIMStatus(bytes32 sim) public mustBeSenderSIM(sim) {
        require(!sims[sim].updateStatus);

        if (!sims[sim].isActivated) {
            require(users[msg.sender].balance >= minimumBalance);

            LogActivateSIM(msg.sender, sim);
        } else {
            LogDeactivateSIM(msg.sender, sim);
        }

        sims[sim].updateStatus = true;
    }

}
