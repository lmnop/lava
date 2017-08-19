/* global fetch */

import { Routes } from './constants';

const makeRequest = async (method, url, body) => {
  try {
    let request = {
      method,
    };

    if (body) {
      request.body = JSON.stringify(body);
    }

    const response = await fetch(`http://localhost:5000${url}`, request);

    let data = await response.json();

    if (!response.ok) {
      return Promise.reject({
        message: data.error,
      });
    }

    return Promise.resolve(data);
  } catch (err) {
    return Promise.reject({
      message: 'failed making request',
    });
  }
};

export const getSIMByICCID = async (iccid) => makeRequest('GET', `${Routes.GET_SIM_ICCID}${iccid}`);
export const getSIMBySID = async (sid) => makeRequest('GET', `${Routes.GET_SIM_SID}${sid}`);

