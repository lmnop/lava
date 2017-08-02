import twilio from 'twilio';

import config from '../config';

const client = new twilio(config.twilio.sid, config.twilio.token);

export const getSIMs = () => new Promse((resolve, reject) => {
  client.preview.wireless.sims
    .list()
    .then((response, error) => {
      if (error) {
        return reject('failed to get SIMs');
      }

      return resolve(response);
    });
});

export const getSIM = (SIM) => new Promse((resolve, reject) => {
  client.preview.wireless
    .sims(SIM)
    .fetch()
    .then((response, error) => {
      if (error) {
        return reject('failed to get SIM');
      }

      return resolve(response);
    });
});

export const getSIMUsage = (SIM) => new Promse((resolve, reject) => {
  client.preview.wireless
    .sims(SIM)
    .usage()
    .fetch()
    .then((response, error) => {
      if (error) {
        return reject('failed to get SIM usage');
      }

      return resolve(response);
    });
});

