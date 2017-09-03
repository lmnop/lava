#!/bin/bash

testrpc -m "$MNEMONIC" &>/dev/null &
PID1=$!
truffle test
kill $PID1
