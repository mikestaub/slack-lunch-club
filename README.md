# Slack Lunch Club

[Live Demo](https://slacklunch.club)

## Overview

Read the series of [blog posts](https://medium.com/@mikestaub22/slack-lunch-club-part-1-7-deep-dive-into-a-modern-web-app-d3eb980a215) for more information about this project.

This application allows a user to input the following:

1.  slack teams via "Login with Slack"
1.  availability
1.  location

To receive a weekly match email with another user who:

1.  shares a common slack team
1.  shares an available day to meet for lunch
1.  is nearby
1.  has not been previously matched

This is a useful tool to help connect slack team members in a easy, fun, and spontaneous way.

## Technology

Core Tech:

1.  React ( create-react-app )
1.  GraphQL
1.  Serverless Framework ( AWS provider )
1.  ArangoDB ( graph database )

Supporting Tech:

1.  styled components
1.  flow type
1.  jest
1.  puppeteer
1.  codecov.io
1.  papertrail
1.  sentry
1.  webpack
1.  prettier
1.  eslint
1.  docker + docker-compose

AWS Services:

1.  S3
1.  EC2
1.  APIGateway
1.  Lambda
1.  CloudFormation
1.  CloudWatch
1.  CloudFront
1.  Route53
1.  VPC
1.  IAM
1.  Certificate Manager
1.  CodeBuild

The end result is a first-class developer experience, which aims to provide a complete production-ready SaaS stack. This stack is primarily for small teams, startups, indie-developers who are on a budget, but also want technology that can scale with increased traction.

## Setup

### Part 1 - Third Party Services

1.  create a slack developer [account](https://api.slack.com/)
1.  create a mailgun [account](https://www.mailgun.com/)
1.  create a papertrail [account](https://papertrailapp.com)
1.  create an AWS [account](https://aws.amazon.com/)
1.  create a codecov [account](https://codecov.io)
1.  create a sentry [account](https://sentry.io)
1.  register a custom domain name ( https://domains.google or namecheap.com recommended )
1.  download and install [Docker](https://www.docker.com)

### Part 2 - Download dependencies

1.  run `npm run dev` to download and start the docker containers
1.  create a new GUUID [here](https://www.guidgenerator.com/) and keep it in a **SAFE** place. This one string is a single point of failure for your application secrets.
1.  run `export ENCRYPTION_KEY=<YOUR_NEW_GUUID>`
1.  run `npm run install:npm`

### Part 3 - Set environment variables

1.  run `cp ./secrets.template.js ./secrets.js`
1.  get `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` [here](https://console.aws.amazon.com/iam/home?region=us-east-1#/users$new), make sure it has admin credentials
1.  get `CODECOV_TOKEN` from codecov.io, after adding this repo, go to the repo settings, and look for the "Repository Upload Token"
1.  get `GITHUB_TOKEN` [here](https://github.com/settings/tokens), grant it "repo" access
1.  set these variables to their correct values in `./secrets.js`

    ```
    AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY
    CODECOV_TOKEN
    GITHUB_TOKEN
    ```

1.  run `cp ./global-aws/secrets.template.js ./global-aws/secrets.js`
1.  `GITHUB_REPO` is the git repo where this file lives
1.  `HOSTED_ZONE_NAME` this is the custom domain name you registered in Part 1
1.  both `PAPERTRAIL_HOST` and `PAPERTRAIL_PORT` can be found [here](https://papertrailapp.com/systems/setup)
1.  set `VPN_USER` and `VPN_PASSWORD` to whatever you like
1.  set these variables to their correct values in `./global-aws/secrets.js`

    ```
    GITHUB_REPO
    HOSTED_ZONE_NAME
    PAPERTRAIL_HOST:
    PAPERTRAIL_PORT
    VPN_USER
    VPN_PASSWORD
    ```

1.  run `npm run encrypt && cd global-aws && npm run encrypt && cd ..` to generate your encrypted secrets files

### Part 4- Deploy global AWS resources

1.  run `exit` then `npm run dev` to reload bash shell
1.  run `export ENCRYPTION_KEY=<YOUR_NEW_GUUID>` again
1.  you must accept the Terms of Use for the AWS Marketplace OpenVPN EC2 AMI here: https://aws.amazon.com/marketplace/server/procurement?productId=fe8020db-5343-4c43-9e65-5ed4a825c931
1.  create a non-public S3 bucket with the name found in `./global-aws/serverless.yml > provider.deploymentBucket`
1.  run `cd global-aws && npm run deploy && cd ..`
1.  wait about 2 minutes for AWS to provision resources, check the status [here](https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks?filter=active). The deployment will not be able to complete until we configure the DNS in the next Part.
1.  create a papertrail alert with `Query = error -("errors")` [here](https://papertrailapp.com/alerts) and have it forward to your email

### Part 5 - Configure DNS

1.  navigate [here](https://console.aws.amazon.com/route53/home?region=us-east-1#hosted-zones) and click on the public hosted zone for your custom domain
1.  copy the 4 name servers from the NS record, and paste them into your domain registrar's settings. ( at domains.google.com for example )
1.  navigate [here](https://app.mailgun.com/app/domains) and create a new domain ( same name as the AWS public hosted zone )
1.  verify your mailgun domain, by adding the 4 DNS records listed under `Domain Verification & DNS`, these records must be added to the AWS public hosted zone
1.  to receive email at the public hosted zone ( ie, admin@yourdomain.com ) we must create a mailgun route to forward the email to an actual email server ( ie, gmail.com ) by navigating [here](https://app.mailgun.com/app/routes) and creating a new route like so:

    ```
    Expression Type: Match Recipient
    Recipient: ".*@YOUR-DOMAIN.com"
    Actions: forward your_name@gmail.com
    ```

1.  wait 10-20 minutes for DNS changes to propagate
1.  click `apps.mailgun.com > Domain Verification & DNS > Check DNS Records Now` ( keep clicking this until all are green and you receive a confirmation email )
1.  once the domain is confirmed, we need to resend the SSL certificate requests so that AWS CloudFormation can resume stack creation. Navigate [here](https://console.aws.amazon.com/acm/home?region=us-east-1),
    select the certificate, then click `Actions > Resend validation email`. Do this for both certificates.
1.  after receiving the SSL confirmation email, open it and click "Approve"
1.  wait another 5 minutes for the global-aws stack to finish deploying

### Step 6 - Configure ArangoDB databases

1.  Navigate [here](https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks), select the global-aws stack, and click the URL under `Outputs > OpenVPNServerURL`
1.  enter the `VPN_USER` and `VPN_PASSWORD` you chose in Part 3, download the OpenVPN client app for your OS and install it
1.  use the same IP, username, and password to connect to the VPN via the OpenVPN client ( trust the profile when prompted )
1.  once the VPN connection is established, navigate to the URL:
    `http://ARANGO_DB_IP:8529`, where `ARANGO_DB_IP` is defined by the CloudFormation `Outputs > ArangoDBInstanceId`
1.  log in to the ArangoDB `_system` database with username "root" and password defined by CloudFormation `Outputs > ArangoDBInstanceId`
1.  add 2 new databases via the UI:
    ```
    Databases > Add Database > "YOUR-DOMAIN-staging"
    Databases > Add Database > "YOUR-DOMAIN-production"
    ```
1.  add 2 database users via the UI:

    ```
    Users > Add User > username="YOUR-DOMAIN-staging",password="GUUID_1"
    Users > Add User > username="YOUR-DOMAIN-production",password="GUUID_2"
    ```

1.  NOTE: The passwords should be 2 different GUUIDs generated [here](https://www.guidgenerator.com/) like the `ENCRYPTION_KEY` in Part 2. Make a note of these passwords, we will need them in the next step.
1.  edit both the users' permissions so that they only have "Administrate" to their associated database, "No Access" to other databases, and "Administrate" to "\_system" database.
1.  disconnect from the VPN

### Part 7 - Deploy the backend API

1.  run `cp ./backend/secrets.template.js backend/secrets.js`
1.  `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET` can be created [here](https://api.slack.com/apps) under `Settings > Basic Information > App Credentials`. Create 2 sets of ID/SECRET pairs, one for staging and one for production.
1.  `AUTH_TOKEN_SECRET` should be a another new GUUID (different for each stage)
1.  `DB_BACKUP_BUCKET_NAME` is defined by the CloudFormation `Outputs > DBBackupBucket`
1.  `SMTP_PASS` can be found at `app.mailgun.com > domains > YOUR_DOMAIN > Domain Information > Default Password`
1.  set these variables in `./backend/secrets.js` to their correct values:

    ```
    SLACK_CLIENT_ID
    SLACK_CLIENT_SECRET
    AUTH_TOKEN_SECRET
    DB_USER:
    DB_PASS:
    DB_NAME
    DB_BACKUP_BUCKET_NAME
    SMTP_PASS
    ```

1.  change the "domainName" variable to YOUR-DOMAIN
1.  run `cd backend && npm run encrypt` to generate you encrypted secrets file
1.  create a non-public S3 bucket with the name defined by `./backend/serverless.yml > provider.deploymentBucket`
1.  run `npm run deploy:staging && npm run deploy:production && cd ..`
1.  add the following Redirect URLs to the Slack App's "OAuth & Permissions" [here](https://api.slack.com/apps/):

    ```
    https://localhost:4000/auth/slack/return
    https://api.YOUR-DOMAIN/auth/slack/return
    https://api-staging.YOUR-DOMAIN/auth/slack/return
    ```

### Part 8 - Deploy the front end

1.  update these 3 files to include the correct value for `REACT_APP_BACKEND_API_URL`, `REACT_APP_SENTRY_URL`, and `REACT_APP_GOOGLE_ANALYTICS_ID`:
    ```
    .env.development
    .env.staging
    .env.production
    ```
1.  `REACT_APP_BACKEND_API_URL` is the same as defined by `./backend/secrets.js > DOMAIN_NAME`, but with the protocol prepended ( ie. https://api-staging.YOUR-DOMAIN.com )
1.  `REACT_APP_SENTRY_URL` can be found [here](https://docs.sentry.io/clients/node/config/)
1.  `REACT_APP_GOOGLE_ANALYTICS_ID` can be found [here](https://analytics.google.com/analytics/web) (make sure to create a view & filter for staging and production)
1.  create a non-public S3 bucket with the name defined by `./frontend/serverless.yml > provider.deploymentBucket`
1.  update the npm commands in `./frontend/package.json` `deploy:staging` and `deploy:production` to have the correct domainName argument
1.  run `cd frontend && npm run deploy:staging && npm run deploy:production && cd ..`
1.  it will take about 30 minutes to deploy, as AWS must provision a CloudFront distribution
1.  after the deploys complete, the app should be live and working at your custom domain!

### Part 9 - Setup and test CI/CD pipeline

1.  [link](https://us-east-1.console.aws.amazon.com/codebuild/home?region=us-east-1#) your github.com account to AWS. Under `Build Projects > Edit (your project) > Source: What to build` you must authenticate github via OAuth
1.  add the `ENCRYPTION_KEY` as an AWS SSM variable [here](https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Parameters:sort=Name) via
    `Create Parameter > Name="/YOUR-DOMAIN/ENCRYPTION_KEY",Type="Secure String", Value="YOUR_KEY"`
1.  edit `./buildspec.yml` to use the correct value at `env.parameter-store.ENCRYPTION_KEY`
1.  push the 3 encrypted secrets files and 3 modified .env files to a new branch and create a PR into master. That PR should show you the build status on CodeBuild. After the build succeeds, merge the PR, and delete the branch. Another build will be kicked off. This time, after it succeeds, your code will be deployed to production. (Note: any build that is not from a push to a PR branch or master with fail, resulting in false positive failures. This should be fixed in the future)

### Part 10 - Add SSL certificates to OS keychain

1.  if you don't do this, the react app cannot hot reload on file save
1.  run `npm run start` this will start the backend and frontend
1.  The following 2 certificates must be added to the keychain locate here:

    ```
    frontend/node_modules/webpack-dev-server/ssl/server.pem

    backend/config/ssl/cert.pem
    ```

1.  Read [here](https://tosbourn.com/getting-os-x-to-trust-self-signed-ssl-certificates/) for OSX instructions, and [here](https://manuals.gfi.com/en/kerio/connect/content/server-configuration/ssl-certificates/adding-trusted-root-certificates-to-the-server-1605.html) for other platforms

## Conclusion

1.  If you have followed the previous steps, you should now have your own web application deployed, along with aggregated logs, monitoring, error reporting, CI/CD, and code/type coverage - congratulations!
1.  This AWS stack should be very affordable (ideally under $10 per month), here are the monthly estimates:

    ```
    $2.50 - Route53
    $2.00 - CodeBuild
    $8.00 - EC2
    ```

1.  These prices assume you are Free Tier eligible. After your 12 months run out you can get free credits by joining [AWS Activate](https://aws.amazon.com/activate)
1.  You can also get $5000 worth of credits by through your https://producthunt.com/ship membership ( $60 per month )
1.  There are many other ways of getting AWS Credits if you search online, though ideally if your service has traction you can charge customers to pay the AWS bill

## How to upgrade ArangoDB ( non-major versions )

1.  in the application repo, replace all instances of old version with new version ( ie. 3.3.3 -> 3.3.8 )
1.  you can ssh into the EC2 instance and run this command: sudo apt-get update; sudo apt-get upgrade
1.  for major version upgrades, be **very** careful migrating the data

## Generate a new ArangoDB EC2 AMI & instance

1.  in the application repo, replace all instances of old version with new version ( ie. 3.3.3 -> 3.3.8 )
1.  run these commands (OSX):
    ```
    brew install packer
    git clone https://github.com/arangodb-helper/ami-appliance.git
    cd ami-appliance/AMAZON
    export AWS_ACCESS_KEY_ID=YOUR_ID
    export AWS_SECRET_ACCESS_KEY=YOUR_KEY
    ```
1.  replace all in ami-appliance project: "t3.medium" > "t2.nano"
1.  run commands:
    ```
    packer build --var 'arangodb_version=3.3.8' --var 'arangodb_name=arangodb3' --var 'arangodb_repo=arangodb33' template.json
    ```
1.  wait about 5 minutes for packer to finish
1.  copy the ami id, paste it into `./global-aws/resources.yml:ArangoDBInstance.Properties.ImageId`, and run `cd ./global-aws && npm run deploy` to create a new EC2 instance
1.  once the new EC2 instance is running, copy its private IP address, paste and update the arangodb.YOURDOMAIN.COM A record in all hosted zones
1.  after the new db instance is deployed, you have to VPN into the web UI, create the databases and users, then restore the data with the db-restore lambda function. Be **very** careful.

## Optional ( recommended ) extras

1.  enable the cost explorer and set a budget to protect against surprise expenses: https://console.aws.amazon.com/billing/home?#/costexplorer
1.  use this tool to help keep your code high quality: https://www.codefactor.io
1.  integrate github.com with slack via https://slack.github.com
1.  use this free service to monitor the website: https://uptimerobot.com
1.  monitor client errors (nice sentry integration): https://logrocket.com
1.  you can protect the master branch so that no PRs can be merged unless the build succeeds: https://github.com/mikestaub/slack-lunch-club/settings/branches/master

## Contributing

This project was my first time using almost all of these technologies. I'm sure there are many things that can be improved. If you think of something do not hesitate to open an issue! I am also looking for help expanding the application so please let me know if you want to collaborate, everyone is welcome. :)
