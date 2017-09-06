import _ from 'lodash';
import moment from 'moment';
import mock from 'mock-require';

import contract from './contract';
import * as twilio from './twilio';

if (process.env.NODE_ENV === 'local') {
  mock('./twilio', {
    getSIMs: () => {
      console.log('getSIMs');

      return {
        sims: [],
      };
    },
  });
}

// async function watch(lava, web3, owner) {
//   try {
//     const activateSIM = lava.LogActivateSIM();
//     const deactivateSIM = lava.LogDeactivateSIM();

//     activateSIM.watch(async (error, event) => {
//       try {
//         if (error) {
//           throw new Error(error);
//         }

//         const user = event.args.user;
//         const hexSIM = event.args.sim;

//         const iccid = web3.toAscii(hexSIM).replace(/\0/g, '');

//         const sim = await twilio.getSIMByIccid(iccid);

//         console.log(`Activating ${sim.iccid}`);

//         await twilio.activateSIM(sim);
//         await lava.updateSIMStatus(hexSIM, {
//           from: owner,
//         });
//       } catch (err) {
//         console.log('ACTIVATE ERROR', err);
//       }
//     });

//     deactivateSIM.watch(async (error, event) => {
//       try {
//         if (error) {
//           throw new Error(error);
//         }

//         const user = event.args.user;
//         const hexSIM = event.args.sim;

//         const iccid = web3.toAscii(hexSIM).replace(/\0/g, '');

//         const sim = await twilio.getSIMByIccid(iccid);

//         console.log(`Suspending ${sim.iccid}`);

//         await twilio.suspendedSIM(sim);
//         await lava.updateSIMStatus(hexSIM, {
//           from: owner,
//         });
//       } catch (err) {
//         console.log('DEACTIVATE ERROR', err);
//       }
//     });
//   } catch (err) {
//     console.log('WATCH ERROR', err);
//   }
// }

async function collectSIM(lava, web3, owner, sim) {
  try {
    console.log(`Checking on ${sim.iccid}`);

    const hexSIM = web3.fromAscii(sim.iccid).padEnd(66, 0);

    const isSIM = await lava.isSIM(hexSIM);

    if (isSIM) {
      const usage = await twilio.getSIMUsage(sim.sid);
      const SIM = await lava.getSIM(hexSIM);
      const dataPaid = SIM[1].toNumber();

      if (usage.total > dataPaid && sim.status === 'active') {
        console.log(`Collecting ${sim.iccid}`);

        await lava.collect(usage.total, hexSIM, {
          from: owner,
        });
      }
    }
  } catch (err) {
    console.log('COLLECT SIM ERROR', err);
  }
}

async function collect(lava, web3, owner, page) {
  try {
    const response = await twilio.getSIMs(page);

    console.log(`Collecting through ${response.sims.length} SIMs`);

    for (let sim of response.sims) {
      await collectSIM(lava, web3, owner, sim);
    }

    if (response.meta.next_page_url) {
      collect(lava, web3, owner, page + 1);
    }
  } catch (err) {
    console.log('COLLECT ERROR', err);
  }
}

async function syncSIM(lava, web3, owner, sim) {
  try {
    console.log(`Syncing ${sim.iccid}`);

    const hexSIM = web3.fromAscii(sim.iccid).padEnd(66, 0);

    const isSIM = await lava.isSIM(hexSIM);

    if (isSIM) {
      const SIM = await lava.getSIM(hexSIM);
      const isActivated = SIM[3];
      const updateStatus = SIM[4];

      if (!isActivated && updateStatus) {
        if (sim.status === 'new' || sim.status === 'active' || sim.status === 'suspended') {
          console.log(`Activating ${sim.iccid}`);

          await twilio.activateSIM(sim);
          await lava.updateSIMStatus(hexSIM, {
            from: owner,
          });
        }
      }

      if (isActivated && updateStatus) {
        if (sim.status === 'active' || sim.status === 'suspended') {
          console.log(`Suspending ${sim.iccid}`);

          await twilio.suspendedSIM(sim);
          await lava.updateSIMStatus(hexSIM, {
            from: owner,
          });
        }
      }

      if (sim.status === 'suspended') {
        if (moment().isAfter(moment(sim.date_updated).add(60, 'days'))) {
          console.log(`Deactivating ${sim.iccid}`);

          await twilio.deactivatedSIM(sim); 
        }
      }
    }
  } catch (err) {
    console.log('COLLECT SIM ERROR', err);
  }
}

async function sync(lava, web3, owner, page) {
  try {
    const response = await twilio.getSIMs(page);

    console.log(`Syncing through ${response.sims.length} SIMs`);

    for (let sim of response.sims) {
      await syncSIM(lava, web3, owner, sim);
    }

    if (response.meta.next_page_url) {
      sync(lava, web3, owner, page + 1);
    }
  } catch (err) {
    console.log('COLLECT ERROR', err);
  }
}

async function initiateContract() {
  try {
    const lava = await contract();
    const web3 = lava.constructor.web3;
    const owner = web3.currentProvider.provider.address;

    //watch(lava, web3, owner);
    collect(lava, web3, owner, 0);
    sync(lava, web3, owner, 0);

    setInterval(() => {
      collect(lava, web3, owner, 0);
    }, 1000 * 60 * 10); // Every 10 minutes

    setInterval(() => {
      sync(lava, web3, owner, 0);
    }, 1000 * 60 * 1); // Every minute
  } catch (err) {
    console.log('INITIATE ERROR', err);

    initiateContract();
  }
}

initiateContract();

