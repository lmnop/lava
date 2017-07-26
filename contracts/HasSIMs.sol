pragma solidity ^0.4.11;


contract HasSIMs {

    struct SIM {
        uint index;             // pointer to simList index
        uint userIndex;         // pointer to sims index on user
        address user;           // address of user
        int dataPaid;           // data in bytes paid for
        int dataConsumed;       // total data in bytes consumed
        bool isActivated;       // if the SIM is activated or not
        bool updateStatus;      // if the SIM should flip it's status from oracle
    }

    mapping (bytes32 => SIM) sims;
    bytes32[] simList;

    modifier mustBeSIM(bytes32 sim) {
        require(isSIM(sim));

        _;
    }

    function isSIM(bytes32 sim) public constant returns (bool) {
        if (simList.length == 0) {
            return false;
        }

        return simList[sims[sim].index] == sim;
    }

    function getSIM(bytes32 sim) public constant mustBeSIM(sim) returns (address user, int dataPaid, int dataConsumed, bool isActivated, bool updateStatus) {
        return (sims[sim].user, sims[sim].dataPaid, sims[sim].dataConsumed, sims[sim].isActivated, sims[sim].updateStatus);
    }

}
