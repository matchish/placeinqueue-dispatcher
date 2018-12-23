FROM node:8-alpine

# install curl, python tooling and other utilities
RUN apk add --update curl python-dev py-pip screen gpgme zip && pip install --upgrade pip && \
	rm -rf /var/cache/apk/*

# install yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | sh
ENV PATH /root/.yarn/bin:$PATH

# install aws-cli
RUN pip install awscli

ARG SERVERLESS_VERSION=1.32.0

# install serverless
RUN npm install serverless@$SERVERLESS_VERSION -g --silent

WORKDIR "/usr/src/myserverless"

COPY package.json .
RUN npm install
COPY . .

# make magic
ENTRYPOINT ["serverless"]