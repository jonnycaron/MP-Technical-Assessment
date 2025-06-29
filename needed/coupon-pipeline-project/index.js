const logger = require('./lib/logger');
const { processCSV } = require('./lib/csvReader');

(async () => {
  logger.info('Starting coupon pipeline...');
  try {
    await processCSV();
    logger.info('Pipeline finished successfully.');
  } catch (err) {
    logger.error(`Pipeline failed: ${err.message}`);
    process.exit(1);
  }
})();
// This script initializes the coupon pipeline by importing necessary modules,
// logging the start of the process, and calling the `processCSV` function.
// It handles any errors that occur during the CSV processing and logs them appropriately.
// If the pipeline completes successfully, it logs a success message; otherwise, it logs the error and exits the process with a failure code.
// This setup is essential for running the coupon pipeline project,
// ensuring that the CSV data is processed correctly and any issues are reported clearly.
// The use of an immediately invoked async function allows for clean asynchronous handling of the CSV processing,
// making the code more readable and maintainable.  