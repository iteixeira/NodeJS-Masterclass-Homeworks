/**
 * Create and export configuration variables
 */

// Container for all the environments
const environments = {};

// Staging (default) environment
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'thisIsASecret',
  maxChecks: 5,
  twilio: {
    accountSid: 'ACb32d411ad7fe886aac54c665d25e5c5d',
    authToken: '9455e3eb3109edc12e3d8c92768f7a67',
    fromPhone: '+15005550006'
  },
  stripe: {
    secret: 'sk_test_1keZkBlHdE0v9HPZ9dhKtLxr00GNX4Tsa5',
    currency: 'cad'
  },
  mailgun: {
    user: 'api',
    key: 'b521db355739b127b54200e435701ff2-1df6ec32-8409d6a5',
    from: 'mailgun@sandbox4ea1a7ae54944a19a4de27cb65817091.mailgun.org'
  }
};

// Determine wich environment was passed as a command-line argument
const currentEnvironment = typeof process.env.NODE_ENV == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not, default to staging
const environmentToExport =
  typeof environments[currentEnvironment] == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;
