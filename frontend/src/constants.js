// CONSTANTS

const dotenv = require('dotenv');
dotenv.config();

export const BASE_SITE_URL =
  process.env.NODE_ENV === 'production'
    ? 'http://mybirthdayreminders.com'
    : 'http://localhost:3000';

export const BASE_SERVER_URL =
  (process.env.NODE_ENV === 'production'
    ? 'http://mybirthdayreminders.com'
    : 'http://localhost:8081') + '/api';
