const axios = require('axios');
const axiosRetry = require('axios-retry');
const { v4: uuidv4 } = require('uuid');
const pLimit = require('p-limit');
const { MPARTICLE_API_KEY, MPARTICLE_API_SECRET, MPARTICLE_API_URL } = require('../config/config');
const logger = require('./logger');

// Create axios instance
const apiClient = axios.create();

// Custom exponential backoff with jitter
const exponentialBackoffWithJitter = (retryNumber = 0) => {
  const baseDelay = Math.pow(2, retryNumber) * 100; // base: 100ms, 200ms, 400ms, 800ms, etc.
  const jitter = Math.random() * 100; // add 0-100ms jitter
  return baseDelay + jitter;
};

// Attach retry logic with custom backoff
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: exponentialBackoffWithJitter,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500,
});

/**
 * Send a batch of rows to mParticle as individual events, with concurrency limit & retry
 * @param {Array} batch - Array of rows: { email, coupon }
 */
async function sendBatch(batch) {
  const limit = pLimit(5); // Concurrency limit

  const promises = batch.map(row =>
    limit(async () => {
      const payload = {
        source_request_id: uuidv4(),
        batch: {
          user_identities: {
            email: row.email,
          },
          events: [
            {
              data: {
                event_name: 'Coupon Signup',
                custom_event_type: 'other',
                custom_attributes: {
                  coupon_code: row.coupon,
                  signup_date: new Date().toISOString(),
                },
                source_message_id: uuidv4(),
              },
            },
          ],
        },
      };

      try {
        const response = await apiClient.post(
          MPARTICLE_API_URL,
          payload,
          {
            auth: {
              username: MPARTICLE_API_KEY,
              password: MPARTICLE_API_SECRET,
            },
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        logger.info(`✅ Event sent for ${row.email} — Status: ${response.status}`);
      } catch (err) {
        logger.error(`❌ Failed for ${row.email} after retries: ${err.message}`);
        throw err;
      }
    })
  );

  await Promise.all(promises);
}

module.exports = {
  sendBatch,
};
