FROM node:slim
WORKDIR /app
COPY . . 
RUN npm install
Expose 7410
CMD node index.js
