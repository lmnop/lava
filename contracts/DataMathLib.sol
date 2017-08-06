pragma solidity ^0.4.11;

import './SafeMathLib.sol';


library DataMathLib {
    using SafeMathLib for uint;

    function paymentToData(uint conversion, uint payment) internal returns (int) {
        return int(payment.div(conversion));
    }

    function dataToPayment(uint conversion, int data) internal returns (uint) {
        return uint(data).mul(conversion);
    }

    function add(uint a, uint b) internal returns (uint) {
        return a.add(b);
    }

    function sub(uint a, uint b) internal returns (uint) {
        return a.sub(b);
    }

    function mul(uint a, uint b) internal returns (uint) {
        return a.mul(b);
    }

    function div(uint a, uint b) internal returns (uint) {
        return a.div(b);
    }
}
