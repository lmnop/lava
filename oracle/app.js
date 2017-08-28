import _ from 'lodash';
import moment from 'moment';

import * as contract from './contract';
import * as twilio from './twilio';

async function watch(web3, lava) {
  try {
    const activateSIM = lava.LogActivateSIM();
    const deactivateSIM = lava.LogDeactivateSIM();

    activateSIM.watch(async (error, event) => {
      try {
        if (error) {
          throw new Error(error);
        }

        const user = event.args.user;
        const hexSIM = event.args.sim;

        const iccid = web3.utils.toAscii(hexSIM).replace(/\0/g, '');

        const sim = await twilio.getSIMByIccid(iccid);

        await twilio.activateSIM(sim);
        await lava.updateSIMStatus(hexSIM, {
          from: web3._requestManager.provider.address,
        });
      } catch (err) {
        console.log('ACTIVATE ERROR', err);
      }
    });

    deactivateSIM.watch(async (error, event) => {
      try {
        if (error) {
          throw new Error(error);
        }

        const user = event.args.user;
        const hexSIM = event.args.sim;

        const iccid = web3.utils.toAscii(hexSIM).replace(/\0/g, '');

        const sim = await twilio.getSIMByIccid(iccid);

        await twilio.suspendedSIM(sim);
        await lava.updateSIMStatus(hexSIM, {
          from: web3._requestManager.provider.address,
        });
      } catch (err) {
        console.log('DEACTIVATE ERROR', err);
      }
    });
  } catch (err) {
    console.log('WATCH ERROR', err);
  }
}

async function collectSIM(web3, lava, sim) {
  try {
    console.log(`Checking on ${sim.iccid}`);

    const hexSIM = web3.utils.fromAscii(sim.iccid).padEnd(66, 0);

    const isSIM = await lava.isSIM(hexSIM);

    if (isSIM) {
      const usage = await twilio.getSIMUsage(sim.sid);
      const SIM = await lava.getSIM(hexSIM);
      const userAddress = SIM[0];
      const dataPaid = SIM[1].toNumber();
      const dataConsumed = SIM[2].toNumber();
      const isActivated = SIM[3];
      const updateStatus = SIM[4];

      if (usage.total > dataPaid && sim.status === 'active') {
        console.log(`Collecting from ${sim.iccid}`);

        await lava.collect(usage.total, hexSIM, {
          from: web3._requestManager.provider.address,
        });
      }

      if (!isActivated && updateStatus) {
        if (sim.status === 'new' || sim.status === 'active' || sim.status === 'suspended') {
          await twilio.activateSIM(sim);
          await lava.updateSIMStatus(hexSIM, {
            from: web3._requestManager.provider.address,
          });
        }
      }

      if (isActivated && updateStatus) {
        if (sim.status === 'active' || sim.status === 'suspended') {
          await twilio.suspendedSIM(sim);
          await lava.updateSIMStatus(hexSIM, {
            from: web3._requestManager.provider.address,
          });
        }
      }

      if (sim.status === 'suspended') {
        if (moment().isAfter(moment(sim.date_updated).add(60, 'days'))) {
          await twilio.deactivatedSIM(sim); 
        }
      }
    }
  } catch (err) {
    console.log('COLLECT SIM ERROR', err);
  }
}

async function collect(web3, lava, page) {
  try {
    const response = await twilio.getSIMs(page);

    console.log(`Working through ${response.sims.length} SIMs`);

    for (let sim of response.sims) {
      await collectSIM(web3, lava, sim);
    }

    if (response.meta.next_page_url) {
      collect(web3, lava, page + 1);
    }
  } catch (err) {
    console.log('COLLECT ERROR', err);
  }
}

async function initiateContract() {
  try {
    const web3 = await contract.getWeb3();
    const lava = await contract.getLavaContract();

    watch(web3, lava);
    collect(web3, lava, 0);

    setInterval(() => {
      collect(web3, lava, 0);
    }, 1000 * 60 * 10); // Every 10 minutes
  } catch (err) {
    console.log('INITIATE ERROR', err);

    initiateContract();
  }
}

initiateContract();

