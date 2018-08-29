class Config {
  constructor() {
    const { env } = process;
    Object.assign(this, {
      env: env.NODE_ENV,
      authTokenSecret: env.AUTH_TOKEN_SECRET,
      domainName: env.DOMAIN_NAME,
      frontendDomainName: env.FRONTEND_DOMAIN_NAME,
      cookieDomainName: env.COOKIE_DOMAIN_NAME,
      apolloEngineApiKey: env.APOLLO_ENGINE_API_KEY,
      aws: {
        dbBackupBucketName: env.DB_BACKUP_BUCKET_NAME,
      },
      slack: {
        clientId: env.SLACK_CLIENT_ID,
        clientSecret: env.SLACK_CLIENT_SECRET,
        cookieExpiration: 1000 * 60, // one minute (cookie deleted once received)
      },
      arangodb: {
        host: env.DB_HOST,
        port: 8529,
        username: env.DB_USER,
        password: env.DB_PASS,
        dbName: env.DB_NAME,
      },
      email: {
        matchPeriodInDays: 7,
        noreplyAddress: env.NOREPLY_EMAIL_ADDRESS,
        testEmailsOnly: env.TEST_EMAILS_ONLY,
        testEmailDomain: env.TEST_EMAIL_DOMAIN,
        smtp: {
          host: env.SMTP_HOST,
          port: 465,
          secure: true,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
        },
      },
      expressRateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 2000,
        delayMs: 0,
      },
    });
  }
}

export default Config;
