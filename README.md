# Lava Contract & Oracle

Contract to register a SIM and manager your data usage. Data usage is paid for by having ether in the contract.

Oracle to listen to lava contract events and interact with Twilio's wireless service.


## Requirements

- [node v8.0.0+](https://nodejs.org/)
- [npm v5.0.0+](https://www.npmjs.com/)
- [yarn](https://yarnpkg.com/)
- [truffle](http://truffleframework.com/)
- [testrpc](https://github.com/ethereumjs/testrpc)
- [solium](https://github.com/duaraghav8/solium)


### Install

```shell
$ yarn install
```


### Test

```shell
$ yarn test
```


### Lint

```
$ yarn lint
```


### Start Oracle

```shell
$ yarn start
```


### Compile Contracts

```shell
$ yarn compile
```


### Deploy on TestRPC

```shell
$ yarn deploy-dev
```


### Deploy on Rinkeby Testnet

```shell
$ yarn deploy-rinkeby
```


### Deploy on Mainnet

```shell
$ yarn deploy
```


### To Import Compiled Lava Contract into a dApp

```shell
$ yarn add git+https://git@github.com/lmnop/lava.git
```
