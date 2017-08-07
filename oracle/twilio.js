import fetch from 'node-fetch';
import config from '../config';

export const getSIMByIccid = async (iccid) => {
  const url = `https://${config.twilio.sid}:${config.twilio.token}@wireless.twilio.com/v1/`;

  const response = await fetch(`${url}Sims?Iccid=${iccid}`);
  const result = await response.json();

  return result.sims[0];
};
