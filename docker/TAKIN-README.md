# Local Deployment Guide for Dify

This guide will walk you through the process of setting up Dify locally for development purposes. The deployment involves setting up both the backend and frontend components, along with necessary middleware services.

## Prerequisites

- Docker and Docker Compose installed
- Python 3.12
- [Poetry](https://python-poetry.org/docs/) for Python dependency management
- Git (for cloning the repository)

## 1. Middleware Setup

The first step is to deploy the required middleware services (databases and caches).

1. Navigate to the `docker` directory:
   ```bash
   cd docker
   ```

2. Create middleware environment file:
   ```bash
   cp middleware.env.example middleware.env
   ```

3. Start middleware services:
   ```bash
   # For Weaviate vector database (default)
   docker compose -f docker-compose.middleware-takin.yaml up -d
   ```
   > Note: If you prefer a different vector database, change the yaml.

## 2. Backend Setup

> **Important Note**: When running locally, you need to modify the pricing API endpoint in `web/app/api/pricing.ts`. After starting test-takin, update the API endpoint from `test.takin.ai` to `localhost:3000` to ensure proper billing functionality.

1. Navigate to the API directory:
   ```bash
   cd ../api
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   > Important: Review and modify the configurations in `.env` file according to your needs.

3. Create and activate Python environment:
   ```bash
   poetry env use 3.12
   poetry shell
   ```

4. Install dependencies:
   ```bash
   poetry install
   ```

5. Run database migrations:
   ```bash
   poetry run python -m flask db upgrade
   ```

6. Start the backend server:
   ```bash
   poetry run python -m flask run --host 0.0.0.0 --port=5001 --debug
   ```

## 3. Worker Service (Optional)

If you need to handle async tasks (e.g., dataset importing, document indexing), start the worker service:

```bash
poetry run python -m celery -A app.celery worker -P gevent -c 1 --loglevel INFO -Q dataset,generation,mail,ops_trace,app_deletion
```

## 4. Frontend Setup

1. Navigate to the web directory:
   ```bash
   cd ../web
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install --frozen-lockfile
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```

   Key environment variables to configure:
   ```env
   NEXT_PUBLIC_DEPLOY_ENV=DEVELOPMENT
   NEXT_PUBLIC_EDITION=SELF_HOSTED
   NEXT_PUBLIC_API_PREFIX=http://localhost:5001/console/api
   NEXT_PUBLIC_PUBLIC_API_PREFIX=http://localhost:5001/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Access the application at `http://localhost:3000`

## Next Steps

After completing the setup, you can:
- Configure your first application
- Start developing new features
- Explore the API documentation

For more detailed information, please refer to our [official documentation](https://docs.dify.ai).
