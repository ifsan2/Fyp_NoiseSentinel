# DigitalOcean Docker Deployment Guide (NoiseSentinel)

This guide deploys:

- Web API (ASP.NET Core) on internal port 5200
- Web Portal (Vite build served by Nginx)
- Caddy reverse proxy with automatic HTTPS
- Domain: noisesentinel.tech

The local development setup remains unchanged.

## Files created for deployment

- docker-compose.yml
- src/NoiseSentinel.WebApi/Dockerfile
- src/Noisesentinel.WebPortal/Dockerfile
- src/Noisesentinel.WebPortal/nginx.conf
- infra/caddy/Caddyfile
- .env.example

## 1) DNS and Cloudflare setup

1. Create a DigitalOcean droplet and note its public IP.
2. In Cloudflare DNS, add:
   - A record: name @ -> droplet IP
   - A record: name www -> droplet IP
3. Cloudflare SSL/TLS settings:
   - Set encryption mode to Full (strict).
4. If HTTPS issuance fails, set the records to DNS only temporarily, wait for the certificate, then switch back to proxied.

## 2) Droplet setup

### Install Docker

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg lsb-release

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Log out and back in to apply the docker group.

### Open firewall ports

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
sudo ufw status
```

### Clone the repo

```bash
git clone https://github.com/yourusername/Fyp_NoiseSentinel.git
cd Fyp_NoiseSentinel
```

## 3) Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env
nano .env
```

Notes:

- If your DB password contains # or spaces, wrap the connection string in double quotes.
- Use a JWT secret of at least 32 characters.
- For Azure SQL, allow the droplet IP in Azure SQL firewall rules.

## 4) Build and run containers

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

## 5) Verify

- Web portal: https://noisesentinel.tech
- API health: https://noisesentinel.tech/api/health
- Swagger is disabled in production.

### Quick mapping checks

Run this from your droplet after deployment:

```bash
curl -fsS https://noisesentinel.tech/api/health
curl -fsS -X POST https://noisesentinel.tech/api/Auth/register/admin \
   -H 'Content-Type: application/json' \
   -d '{}'
```

- The first command should return a JSON health payload.
- The second command should return a 400 validation response, not 404.
- If you get 404, the `/api` reverse proxy is not reaching the Web API.
- If you get network or SSL errors, check Cloudflare, Caddy, and ports 80/443.

For a combined check, use [check_deployment.sh](check_deployment.sh).

## 6) Update deployment

```bash
git pull
docker compose up -d --build
```

Optional cleanup:

```bash
docker image prune -f
```

## 7) Local development (unchanged)

- Web API: run locally as before and use http://localhost:5200
- Web Portal: npm run dev (Vite uses local proxy)
- Mobile App: use local IP for dev and the production domain for release builds

## 8) Mobile app production setup

The production base URL is already set in:

- NoiseSentinel.MobileApp/src/utils/constants.ts -> https://noisesentinel.tech/api

For release builds (Expo/EAS example):

```bash
npm install -g eas-cli
eas build -p android
```

Use your existing mobile release process if different.

## 9) Domain changes later

If you change the domain:

1. Update infra/caddy/Caddyfile
2. Update CORS origins in src/NoiseSentinel.WebApi/Program.cs
3. Update VITE_API_BASE_URL in .env and rebuild containers

## 10) Troubleshooting

- HTTPS fails: confirm ports 80/443 are open and Cloudflare is set to Full (strict).
- 502 from Caddy: check docker compose logs for webapi and webportal.
- CORS errors: verify the production domain is in Program.cs and rebuild.
