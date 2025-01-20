# Local Setup for Takin-Dify

This guide helps you set up Takin+Dify for local development and testing.

## Prerequisites

- Docker and Docker Compose installed
- Python 3.12
- [Poetry](https://python-poetry.org/docs/) for Python dependency management
- Git (for cloning the repository)
- PostgreSQL installed locally

## 1. Database Setup

### PostgreSQL Installation and Configuration

1. Install PostgreSQL:
```bash
# On macOS using Homebrew
brew install postgresql@16
brew services start postgresql@16
```

2. Install pgvector extension:
```bash
# Install PostgreSQL development files and build tools
brew install postgresql@16
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
make install  # Use sudo make install if you encounter permission issues
```

3. Create required databases:
```bash
# Connect to PostgreSQL
psql postgres

# Create databases 
# Main Takin service database (user information, etc.)
CREATE DATABASE takin;   
# Main Dify service database (workflows, etc.)
CREATE DATABASE dify;      
# Vector database for Dify
CREATE DATABASE dify_vector; 

# Enable pgvector extension for vector database
\c dify_vector
CREATE EXTENSION IF NOT EXISTS vector;

# Verify pgvector installation
\dx vector

# Exit psql
\q
```

Note: By default, the database connection string will be `postgresql://postgres:@localhost:5432/database`. If you modify the username, password, or port, you'll need to update the corresponding `.env` files.

## 2. Middleware Setup

First, deploy the required middleware services:

1. Navigate to the `docker` directory:
   ```bash
   cd docker
   ```

2. Create middleware environment file:
   ```bash
   cp takin.middleware.env.example middleware.env
   ```

3. Start middleware services:
   ```bash
   docker compose -f docker-compose.middleware-takin.yaml up -d
   ```

This will start the following services:
- Redis
- Sandbox
- SSRF Proxy

## 3. Backend Setup

1. Navigate to the API directory:
   ```bash
   cd ../api
   ```

2. Set up environment variables:
   ```bash
   cp takin.env.example .env
   ```

   Required environment variables include:
   - SECRET_KEY
   - S3_USE_AWS_MANAGED_IAM
   - S3_ENDPOINT
   - S3_BUCKET_NAME
   - S3_ACCESS_KEY
   - S3_SECRET_KEY
   - S3_REGION

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

## 4. Frontend Setup

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
   cp takin.env.example .env.local
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

5. Access the application at `http://localhost:3000`

## Next Steps

For the final step of setting up the main Takin system, please refer to:
https://github.com/datamonet/takin-test/blob/main/README.md


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