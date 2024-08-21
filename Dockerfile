FROM ghcr.io/puppeteer/puppeteer:23.1.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
USER root
RUN mkdir -p /usr/src/app/src/routes/pdfFiles && \
    chmod -R 777 /usr/src/app/src/routes/pdfFiles
USER node
EXPOSE 3000
CMD [ "npm", "start" ]
