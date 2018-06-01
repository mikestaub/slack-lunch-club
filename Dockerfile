FROM mikestaub/serverless-node-puppeteer:8.10.0

RUN yarn global add npm-check-updates

# install arangodump and arangorestore binaries
RUN apt-get update
RUN curl -O https://download.arangodb.com/arangodb33/xUbuntu_16.04/Release.key
RUN apt-key add - < Release.key
RUN echo 'deb https://download.arangodb.com/arangodb33/xUbuntu_16.04/ /' | tee /etc/apt/sources.list.d/arangodb.list
RUN echo 'deb http://ftp.debian.org/debian jessie-backports main' >> /etc/apt/sources.list
RUN apt-get install -y apt-transport-https
RUN echo 'installing arangodb v3.3.8'
RUN apt-get update
RUN apt-get install -y libssl1.0.0=1.0.2l-1~bpo8+1
RUN apt-get install -y arangodb3-client=3.3.8

# add env vars to bash session (requires ./secrets.js file exist)
RUN echo 'export $(npm run --silent print-env-vars)' >> ~/.bashrc

WORKDIR /opt/app