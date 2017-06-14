module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: "*",
    },
    test: {
      host: 'localhost',
      port: 8546,
      network_id: "*",
    },
    live: {
      host: 'localhost',
      port: 8547,
      network_id: 1,
    },
  }
};
