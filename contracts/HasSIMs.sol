pragma solidity ^0.4.11;


contract HasSIMs {

    struct SIM {
        uint index;                                     // pointer to simList index
        uint userIndex;                                 // pointer to sims index on user
        address user;                                   // address of user
        int dataPaid;                                   // data in bytes paid for
        int dataConsumed;                               // total data in bytes consumed
        uint lastCollection;                            // timestamp for last time a collection was made
        bool isActivated;                               // if the SIM is activated or not
        bool updateStatus;                              // if the SIM should flip it's status from oracle
    }

    mapping (bytes19 => SIM) sims;
    bytes19[] simList;

    modifier mustBeSIM(bytes19 sim) {
        require(isSIM(sim));

        _;
    }

    function isSIM(bytes19 sim) public constant returns (bool) {
        if (simList.length == 0) {
            return false;
        }

        return simList[sims[sim].index] == sim;
    }

    function getSIM(bytes19 sim) public constant mustBeSIM(sim) returns (address user, int dataPaid, int dataConsumed, uint lastCollection, bool isActivated) {
        return (sims[sim].user, sims[sim].dataPaid, sims[sim].dataConsumed, sims[sim].lastCollection, sims[sim].isActivated);
    }

}
