/* global fetch */

import { Routes } from './constants';

const makeRequest = async (method, url, body) => {
  try {
    let request = {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${window.btoa(`${process.env.REACT_APP_API_USER}:${process.env.REACT_APP_API_PASS}`)}`,
      },
    };

    if (body) {
      request.body = JSON.stringify(body);
    }

    let baseUrl = 'http://localhost:5000';

    if (process.env.NODE_ENV === 'production') {
      baseUrl = 'https://api.lmnop.network';
    }

    const response = await fetch(`${baseUrl}${url}`, request);

    let data = await response.json();

    if (!response.ok) {
      return Promise.reject({
        message: data.error,
      });
    }

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject({
      message: 'failed making request',
    });
  }
};

export const getSIMByICCID = async (iccid) => makeRequest('GET', `${Routes.GET_SIM_ICCID}${iccid}`);
export const getSIMBySID = async (sid) => makeRequest('GET', `${Routes.GET_SIM_SID}${sid}`);

