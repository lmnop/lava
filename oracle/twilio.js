import fetch from 'node-fetch';
import config from '../config';

const client = require('twilio')(config.twilio.sid, config.twilio.token);

export const getSIMByIccid = async (iccid) => {
  const url = `https://${config.twilio.sid}:${config.twilio.token}@wireless.twilio.com/v1/`;

  const response = await fetch(`${url}Sims?Iccid=${iccid}`);
  const result = await response.json();

  return result.sims[0];
};

export const getSIM = async (sid) => {
  const url = `https://${config.twilio.sid}:${config.twilio.token}@wireless.twilio.com/v1/`;

  const response = await fetch(`${url}Sims/${sid}`);
  const result = await response.json();

  return result.sims[0];
};

export const getSIMs = async (page) => {
  const url = `https://${config.twilio.sid}:${config.twilio.token}@wireless.twilio.com/v1/`;

  const response = await fetch(`${url}Sims?Page=${page}`);
  const result = await response.json();

  return result;
};

export const getSIMUsage = async (sid) => {
  const url = `https://${config.twilio.sid}:${config.twilio.token}@wireless.twilio.com/v1/`;

  const response = await fetch(`${url}Sims/${sid}/UsageRecords?Start=2017-01-01T00:00:00Z`);
  const result = await response.json();

  return result.usage_records[0].data;
};

export const activateSIM = async (sim) => {
  const response = await client.wireless
    .sims(sim.sid)
    .update({
      uniqueName: sim.iccid,
      status: 'active',
      ratePlan: 'lava',
    });

    return response;
};

export const suspendedSIM = async (sim) => {
  const response = await client.wireless
    .sims(sim.sid)
    .update({
      status: 'suspended',
    });

    return response;
};

export const deactivatedSIM = async (sim) => {
  const response = await client.wireless
    .sims(sim.sid)
    .update({
      status: 'deactivated',
    });

    return response;
};
