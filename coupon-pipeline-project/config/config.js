require('dotenv').config();

module.exports = {
  MPARTICLE_API_KEY: process.env.MPARTICLE_API_KEY,
  MPARTICLE_API_SECRET: process.env.MPARTICLE_API_SECRET,
  MPARTICLE_API_URL: process.env.MPARTICLE_API_URL,
  BATCH_SIZE: parseInt(process.env.BATCH_SIZE) || 1000,
  CSV_PATH: './data/coupon_signups.csv',
};
// This configuration file loads environment variables for mParticle API credentials,
// the API URL, batch size for processing, and the path to the CSV file.
// It uses dotenv to manage these variables, allowing for easy configuration without hardcoding sensitive information.
// The default batch size is set to 1000 if not specified in the environment variables.
// The CSV path is set to a relative path where the coupon signups CSV file is expected to be located.
// This setup is essential for the coupon pipeline project to function correctly, ensuring that sensitive
// information is not exposed in the codebase and can be easily changed based on the environment (development, staging, production).
// The configuration is exported as a module, making it accessible throughout the application.
// This modular approach allows for better maintainability and scalability of the project as it grows.  