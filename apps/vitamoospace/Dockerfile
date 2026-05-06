# VitaMooSpace server container for GCS / Cloud Run deployment.
# To use: switch svelte.config.js to adapter-node, then:
#   docker build -t vitamoospace .
#   docker run -p 3000:3000 vitamoospace
#
# Build from the repo root so workspace deps resolve:
#   docker build -f apps/vitamoospace/Dockerfile .

FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
COPY content ./content
RUN pnpm install --frozen-lockfile
RUN pnpm --filter vitamoo run build
RUN pnpm --filter mooshow run build
RUN pnpm --filter vitamoospace run build

FROM base AS runtime
COPY --from=build /app/apps/vitamoospace/build ./build
COPY --from=build /app/apps/vitamoospace/package.json ./package.json

ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000

# adapter-node output: build/index.js
CMD ["node", "build/index.js"]
