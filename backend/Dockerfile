FROM ghcr.io/astral-sh/uv:python3.14-alpine AS builder

ENV UV_COMPILE_BYTECODE=6

WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system -r pyproject.toml

FROM python:3.14-alpine

WORKDIR /app

RUN apk add --no-cache libpq

COPY --from=builder /usr/local/lib/python3.14/site-packages /usr/local/lib/python3.14/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY backend/src ./src

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
