### Docker Deployment

The Nepal Reforms Platform can be deployed using Docker for both development and production environments. Follow these instructions to get started with Docker:

#### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)

#### Development with Docker

1. **Start the development environment**:
```bash
docker compose up web-dev
```
This will start the application in development mode with hot-reloading at [http://localhost:3000](http://localhost:3000).

2. **Access the development container**:
```bash
docker compose exec web-dev sh
```

#### Production Deployment

1. **Build and start the production container**:
```bash
# Build the production image
docker compose build web

# Start the container
docker compose up -d web
```

2. **Check the logs**:
```bash
docker compose logs -f web
```

#### Environment Variables

Create a `.env` file with your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Add other required environment variables
```

#### Docker Commands Reference

```bash
# Stop all containers
docker compose down

# Rebuild containers
docker compose build

# View container logs
docker compose logs -f

# Remove all containers and volumes
docker compose down -v
```

For more detailed information about our Docker setup, please refer to our [Docker documentation](docs/docker-setup.md).