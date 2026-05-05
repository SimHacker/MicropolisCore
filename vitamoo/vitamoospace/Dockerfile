# VitaMooSpace server container for GCS / Cloud Run deployment.
# To use: switch svelte.config.js to adapter-node, then:
#   docker build -t vitamoospace .
#   docker run -p 3000:3000 vitamoospace
#
# Build from the repo root so workspace deps resolve:
#   docker build -f vitamoo/vitamoospace/Dockerfile .

FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY vitamoo/package.json vitamoo/package.json
COPY vitamoo/mooshow/package.json vitamoo/mooshow/package.json
COPY vitamoo/vitamoospace/package.json vitamoo/vitamoospace/package.json
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/vitamoo/node_modules ./vitamoo/node_modules
COPY --from=deps /app/vitamoo/mooshow/node_modules ./vitamoo/mooshow/node_modules
COPY --from=deps /app/vitamoo/vitamoospace/node_modules ./vitamoo/vitamoospace/node_modules
COPY . .
RUN pnpm --filter vitamoo run build
RUN pnpm --filter mooshow run build
RUN pnpm --filter vitamoospace run build

FROM base AS runtime
COPY --from=build /app/vitamoo/vitamoospace/build ./build
COPY --from=build /app/vitamoo/vitamoospace/package.json ./package.json

ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000

# adapter-node output: build/index.js
CMD ["node", "build/index.js"]
