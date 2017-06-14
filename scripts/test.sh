#!/bin/bash

testrpc &>/dev/null &
PID1=$!
truffle test
kill $PID1
