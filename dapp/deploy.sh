#!/bin/bash

yarn build &&
cd build &&
git init &&
git remote add origin https://github.com/lmnop/lava-dapp.git &&
git add -A &&
git commit -m "new release" &&
git push --set-upstream origin master
