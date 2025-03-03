FROM node:20

WORKDIR /app

# Force pure JS mode for Rollup (skip native module issues)
ENV NODE_ENV=development
ENV ROLLUP_PURE=true

COPY ./client/package*.json ./
RUN npm install --include=dev

COPY ./client .

EXPOSE 5173

CMD ["npx", "vite", "--host"]