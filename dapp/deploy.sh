#!/bin/bash

yarn build &&
cd build &&
git add -A &&
git commit -m "new release" &&
git push
