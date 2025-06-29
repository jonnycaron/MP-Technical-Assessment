// lib/csvReader.js

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const logger = require('./logger');
const { logFailedRows } = require('./logger');
const mparticleClient = require('./mparticleClient');
const { BATCH_SIZE, CSV_PATH } = require('../config/config');

async function processCSV() {
  return new Promise((resolve, reject) => {
    const batch = [];
    let totalRows = 0;
    let batchCount = 0;

    const stream = fs.createReadStream(path.resolve(CSV_PATH))
      .pipe(csv(['email', 'coupon']));

    stream.on('data', async (row) => {
      const email = row.email && row.email.trim();
      const coupon = row.coupon && row.coupon.trim();

      if (email && coupon) {
        batch.push({ email, coupon });
        totalRows++;
      } else {
        logger.warn(`Invalid row skipped: ${JSON.stringify(row)}`);
      }

      if (batch.length >= BATCH_SIZE) {
        stream.pause();
        batchCount++;

        try {
          await mparticleClient.sendBatch(batch);
          logger.info(`✅ Batch ${batchCount} sent successfully (${batch.length} rows)`);
        } catch (err) {
          logger.error(`❌ Batch ${batchCount} failed after retries: ${err.message}`);
          logFailedRows(batch); // <-- Save the failed rows
          logger.info(`⚠️  Failed rows saved to logs/error.log`);
        }

        batch.length = 0;
        stream.resume();
      }
    });

    stream.on('end', async () => {
      if (batch.length > 0) {
        batchCount++;
        try {
          await mparticleClient.sendBatch(batch);
          logger.info(`✅ Final batch ${batchCount} sent successfully (${batch.length} rows)`);
        } catch (err) {
          logger.error(`❌ Final batch ${batchCount} failed after retries: ${err.message}`);
          logFailedRows(batch);
          logger.info(`⚠️  Failed rows saved to logs/error.log`);
        }
      }
      logger.info(`🎉 CSV processing completed. Total valid rows: ${totalRows}`);
      resolve();
    });

    stream.on('error', (err) => {
      logger.error(`🚫 Error reading CSV: ${err.message}`);
      reject(err);
    });
  });
}

module.exports = {
  processCSV,
};
// This module reads a CSV file containing coupon signups, processes each row, and sends batches of data to mParticle.
// It uses the `csv-parser` library to parse the CSV file and the `fs`          