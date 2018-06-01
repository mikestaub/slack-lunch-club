const domainName = "your-domain.com";

module.exports = {
  NODE_ENV: {
    development: "development",
    staging: "staging",
    production: "production",
  },
  SLACK_CLIENT_ID: {
    development: "PLACE_HOLDER",
    staging: "PLACE_HOLDER",
    production: "PLACE_HOLDER",
  },
  SLACK_CLIENT_SECRET: {
    development: "PLACE_HOLDER",
    staging: "PLACE_HOLDER",
    production: "PLACE_HOLDER",
  },
  AUTH_TOKEN_SECRET: {
    development: "PLACE_HOLDER",
    staging: "PLACE_HOLDER",
    production: "PLACE_HOLDER",
  },
  DOMAIN_NAME: {
    development: "localhost:4000",
    staging: `api-staging.${domainName}`,
    production: `api.${domainName}`,
  },
  DB_HOST: {
    development: "PLACE_HOLDER",
    staging: "PLACE_HOLDER",
    production: "PLACE_HOLDER",
  },
  DB_USER: {
    development: "NA",
    staging: "staging",
    production: "production",
  },
  DB_PASS: {
    development: "NA",
    staging: "PLACE_HOLDER",
    production: "PLACE_HOLDER",
  },
  DB_NAME: {
    development: "PLACE_HOLDER",
    staging: "PLACE_HOLDER",
    production: "PLACE_HOLDER",
  },
  DB_BACKUP_BUCKET_NAME: {
    development: "PLACE_HOLDER",
    staging: "PLACE_HOLDER",
    production: "PLACE_HOLDER",
  },
  SMTP_HOST: {
    development: "smtp.mailgun.org",
    staging: "smtp.mailgun.org",
    production: "smtp.mailgun.org",
  },
  SMTP_USER: {
    development: `postmaster@${domainName}`,
    staging: `postmaster@${domainName}`,
    production: `postmaster@${domainName}`,
  },
  SMTP_PASS: {
    development: "PLACE_HOLDER",
    staging: "PLACE_HOLDER",
    production: "PLACE_HOLDER",
  },
  ADMIN_EMAIL_ADDRESS: {
    development: `admin@${domainName}`,
    staging: `admin@${domainName}`,
    production: `admin@${domainName}`,
  },
  NOREPLY_EMAIL_ADDRESS: {
    development: `noreply@${domainName}`,
    staging: `noreply@${domainName}`,
    production: `noreply@${domainName}`,
  },
  TEST_EMAILS_ONLY: {
    development: true,
    staging: false,
    production: false,
  },
  TEST_EMAIL_DOMAIN: {
    development: `test.${domainName}`,
    staging: `test.${domainName}`,
    production: `test.${domainName}`,
  },
  FRONTEND_DOMAIN_NAME: {
    development: "localhost",
    staging: `staging.${domainName}`,
    production: domainName,
  },
  HOSTED_ZONE_ID: {
    development: "NA",
    staging: "${self:custom.globalAws.PrivateHostedZoneId}",
    production: "${self:custom.globalAws.PublicHostedZoneId}",
  },
};
