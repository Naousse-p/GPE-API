# # Dockerfile

# # Étape de base
# FROM node:20-alpine as base
# WORKDIR /src
# COPY package*.json ./

# # Étape de production
# FROM base as production
# ENV NODE_ENV=production
# RUN npm ci
# COPY . .
# CMD ["node", "app.js"]

# # Étape de développement
# FROM base as dev
# RUN apk add --no-cache bash chromium chromium-chromedriver
# RUN wget -O /bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
# RUN chmod +x /bin/wait-for-it.sh
# ENV NODE_ENV=development

# RUN  npm install --legacy-peer-deps


# RUN npm install -g nodemon
# RUN npm install
# RUN npm install puppeteer-core
# COPY . .
# CMD ["bash", "-c", "node app.js & node consumer.js"]
