# Takin Dify Local Development

Takin Frontend is running locally: `http://localhost:3000`
Dify Frontend is running locally: `http://localhost:3001`
Dify API is running locally: `http://localhost:5001`

⚠️ **Important Note About TAKIN_API_URL**
Before proceeding with deployment, please note:
- For backend use `TAKIN_API_URL=http://localhost:3000`
- for front end use `NEXT_PUBLIC_TAKIN_API_URL=http://localhost:3000`
- It determines where the system accesses user information, billing operations, and other integration APIs
- Must be properly configured in both:
  - Frontend (.env): Controls authentication and user interface integrations： `web/.env`
  - Backend (.env): Controls billing operations and user information retrieval: `api/.env`


## Local PostgreSQL Installation and Configuration

1. Set up PostgreSQL locally by following the instructions below: https://github.com/datamonet/takin-test?tab=readme-ov-file#local-database-setup

2. Install pgvector extension:
```bash
# Install PostgreSQL development files and build tools
brew install postgresql@16
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
make install  # Use sudo make install if you encounter permission issues
```

3. Create Dify required databases:
```bash
# Connect to PostgreSQL
psql postgres

# Create databases 
# Main Dify service database (workflows, etc.)
CREATE DATABASE dify;      
# Vector database for Dify
CREATE DATABASE dify_vector; 

# Enable pgvector extension for vector database
\c dify_vector  # The \c command (or \connect) is a psql meta-command that establishes a connection to a PostgreSQL database.
CREATE EXTENSION IF NOT EXISTS vector;

# Verify pgvector installation
\dx vector  # \dx is a psql meta-command that displays all installed extensions

# Exit psql
\q  
```

Note: By default, the database connection string will be `postgresql://postgres:@localhost:5432/database`. If you modify the username, password, or port, you'll need to update the corresponding `.env` files.

## Middleware (Redis, Sandbox, SSRF Proxy) Setup

First, deploy the required middleware services:

1. Navigate to the `docker` directory:
   ```bash
   cd docker
   ```

2. No `.env` is needed for local development and testing, the default values are specified in the following yaml file.

3. Start middleware services:
   ```bash
   docker compose -f docker-compose.middleware-takin.yaml up -d # start middleware services -d means run in background
   docker compose -f docker-compose-takin.yaml down # clean up if needed
   ```

This will start the following services:

- Redis: you can use `docker exec docker-redis-1 redis-cli -a difyai123456 config get requirepass` to test whether Redis is working properly
- Sandbox
- SSRF Proxy

## Backend Setup

1. Navigate to the API directory:
   ```bash
   cd ../api
   ```

2. Set up environment variables:
   ```bash
   cp takin.env.example .env
   ```
   Make sure to have `TAKIN_API_URL=http://localhost:3000`
   
   For redis - make sure to use `REDIS_USERNAME=default` instead of `REDIS_USERNAME=`:

   ```
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_USERNAME=default
   REDIS_PASSWORD=difyai123456
   REDIS_USE_SSL=false
   REDIS_DB=0
   ```

   For S3:

   ```
   S3_ADDRESS_STYLE=path
   S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
   S3_BUCKET_NAME=takin-dify-dev
   S3_ACCESS_KEY=xxx
   S3_SECRET_KEY=xxx
   S3_REGION=us-east-1
   ```

**Attention**: `SECRET_KEY=xxx` this should be set same as the Takin `.env` variable `AUTH_SECRET=` so that two systems can talk. 

3. Create and activate Python environment:
   ```bash
   poetry env use 3.12  # use Python 3.12 for your project's virtual environment
   poetry shell  # activate the virtual environment
   ```

4. Install dependencies:
   ```bash
   poetry install  # install dependencies
   ```

5. Run database migrations:
   ```bash
   poetry run python -m flask db upgrade  # run database migrations
   ```

TODO: ADD documentation for database migrations: `flask db migrate -m "add:takin db model update"`


6. Start the backend server:
   ```bash
   poetry run python -m flask run --host 0.0.0.0 --port=5001 --debug
   ```

## Frontend Setup

1. Navigate to the web directory:
   ```bash
   cd ../web
   ```

2. Install dependencies:
   ```bash
   yarn install --frozen-lockfile
   ```

3. Configure environment variables:
   ```bash
   cp takin.env.example .env
   ```
   use the following:
   ```
   NEXT_PUBLIC_API_PREFIX=http://localhost:5001/console/api
   NEXT_PUBLIC_PUBLIC_API_PREFIX=http://localhost:5001/api
   NEXT_PUBLIC_CALLBACK_URL=http://localhost:3001/apps
   NEXT_PUBLIC_TAKIN_API_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

5. Access the application at `http://localhost:3001`

Now, you can setup Takin Frontend.


## Troubleshooting

### Unable to Use Dify Tools

If you cannot access or use Dify tools after initial setup, follow these steps:

1. Update User Role in Takin Database:
```sql
# Connect to takin database
psql postgres
\c takin

# Update your user role to admin
UPDATE users SET role = 'admin' WHERE email = 'your.email@example.com';
```

2. Configure Dify Tools:
   - Log in to the Dify interface
   - Navigate to the Tools section in the sidebar
   - For each tool you want to use:
     - Click on the tool to open its configuration panel
     - Input the required API keys and credentials
     - Save the configuration

Note: Make sure to restart both Takin and Dify services after making these changes for them to take effect.