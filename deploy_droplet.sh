#!/usr/bin/env bash
set -euo pipefail

log() {
  printf "\n[INFO] %s\n" "$1"
}

warn() {
  printf "\n[WARN] %s\n" "$1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

REPO_URL="${REPO_URL:-https://github.com/ifsan2/Fyp_NoiseSentinel.git}"
APP_DIR="${APP_DIR:-Fyp_NoiseSentinel}"
DOMAIN="${DOMAIN:-noisesentinel.tech}"
VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://${DOMAIN}/api}"
DO_UPGRADE="${DO_UPGRADE:-1}"

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This script requires Ubuntu/Debian with apt-get."
  exit 1
fi

SUDO=""
if [[ "${EUID}" -ne 0 ]]; then
  SUDO="sudo"
fi

log "Installing base packages"
$SUDO apt-get update
if [[ "$DO_UPGRADE" == "1" ]]; then
  $SUDO apt-get upgrade -y
fi
$SUDO apt-get install -y ca-certificates curl gnupg lsb-release git ufw

if ! command -v docker >/dev/null 2>&1; then
  log "Installing Docker"
  $SUDO install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  $SUDO chmod a+r /etc/apt/keyrings/docker.gpg

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null

  $SUDO apt-get update
  $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  $SUDO systemctl enable --now docker
fi

DOCKER="docker"
if ! docker info >/dev/null 2>&1; then
  DOCKER="sudo docker"
fi

NEED_RELOGIN=0
if [[ "${EUID}" -ne 0 ]]; then
  if ! groups "$USER" | grep -q "\bdocker\b"; then
    $SUDO usermod -aG docker "$USER"
    NEED_RELOGIN=1
  fi
fi

if command -v ufw >/dev/null 2>&1; then
  log "Configuring firewall"
  $SUDO ufw allow OpenSSH
  $SUDO ufw allow 80
  $SUDO ufw allow 443
  $SUDO ufw --force enable
fi

PUBLIC_IP=""
if command -v curl >/dev/null 2>&1; then
  PUBLIC_IP=$(curl -fsSL https://api.ipify.org || true)
fi

log "Cloudflare DNS step"
if [[ -n "$PUBLIC_IP" ]]; then
  echo "Public IP detected: $PUBLIC_IP"
else
  echo "Public IP not detected. Use your droplet IP."
fi

echo "Create A records in Cloudflare:"
echo "- @ -> droplet IP"
echo "- www -> droplet IP"
echo "SSL/TLS mode should be Full (strict)."
read -r -p "Continue after DNS is set? (yes/no) [yes]: " DNS_CONFIRM
DNS_CONFIRM=${DNS_CONFIRM:-yes}
if [[ "$DNS_CONFIRM" != "yes" ]]; then
  echo "Stop here. Set DNS, then re-run this script."
  exit 0
fi

log "Cloning or updating repo"
if [[ -d "$APP_DIR/.git" ]]; then
  git -C "$APP_DIR" pull
else
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

escape_env_value() {
  local raw="$1"
  raw="${raw//\\/\\\\}"
  raw="${raw//\"/\\\"}"
  printf "\"%s\"" "$raw"
}

get_env_value() {
  local key="$1"
  local line
  line=$(grep -E "^${key}=" .env | head -n 1 || true)
  line="${line#${key}=}"
  line="${line%$'\r'}"
  if [[ "$line" == \"*\" ]]; then
    line="${line#\"}"
    line="${line%\"}"
  fi
  printf "%s" "$line"
}

set_env_value() {
  local key="$1"
  local val="$2"
  local escaped
  escaped=$(escape_env_value "$val")
  if grep -q "^${key}=" .env; then
    sed -i -E "s|^${key}=.*|${key}=${escaped}|" .env
  else
    printf "%s=%s\n" "$key" "$escaped" >> .env
  fi
}

read -r -p "Update .env values now? (yes/no) [yes]: " UPDATE_ENV
UPDATE_ENV=${UPDATE_ENV:-yes}
if [[ "$UPDATE_ENV" == "yes" ]]; then
  log "Configuring environment variables"

  db_current=$(get_env_value "DB_CONNECTION_STRING")
  while true; do
    read -r -s -p "DB connection string (hidden, leave blank to keep current): " DB_CONN
    echo
    if [[ -n "$DB_CONN" ]]; then
      set_env_value "DB_CONNECTION_STRING" "$DB_CONN"
      break
    elif [[ -n "$db_current" ]]; then
      break
    else
      echo "DB connection string is required."
    fi
  done

  jwt_current=$(get_env_value "JWT_SECRET")
  read -r -s -p "JWT secret (hidden, leave blank to keep current or auto-generate): " JWT_SECRET
  echo
  if [[ -n "$JWT_SECRET" ]]; then
    set_env_value "JWT_SECRET" "$JWT_SECRET"
  elif [[ -n "$jwt_current" ]]; then
    :
  else
    if command -v openssl >/dev/null 2>&1; then
      JWT_SECRET=$(openssl rand -base64 48)
    else
      JWT_SECRET=$(head -c 48 /dev/urandom | base64)
    fi
    set_env_value "JWT_SECRET" "$JWT_SECRET"
    warn "JWT secret generated automatically"
  fi

  jwt_issuer=$(get_env_value "JWT_ISSUER")
  read -r -p "JWT issuer [${jwt_issuer:-NoiseSentinelAPI}]: " JWT_ISSUER
  JWT_ISSUER=${JWT_ISSUER:-${jwt_issuer:-NoiseSentinelAPI}}
  set_env_value "JWT_ISSUER" "$JWT_ISSUER"

  jwt_audience=$(get_env_value "JWT_AUDIENCE")
  read -r -p "JWT audience [${jwt_audience:-NoiseSentinelClient}]: " JWT_AUDIENCE
  JWT_AUDIENCE=${JWT_AUDIENCE:-${jwt_audience:-NoiseSentinelClient}}
  set_env_value "JWT_AUDIENCE" "$JWT_AUDIENCE"

  jwt_exp=$(get_env_value "JWT_EXPIRATION_MINUTES")
  read -r -p "JWT expiration minutes [${jwt_exp:-1440}]: " JWT_EXP
  JWT_EXP=${JWT_EXP:-${jwt_exp:-1440}}
  set_env_value "JWT_EXPIRATION_MINUTES" "$JWT_EXP"

  smtp_host=$(get_env_value "SMTP_HOST")
  read -r -p "SMTP host [${smtp_host:-smtp.gmail.com}]: " SMTP_HOST
  SMTP_HOST=${SMTP_HOST:-${smtp_host:-smtp.gmail.com}}
  set_env_value "SMTP_HOST" "$SMTP_HOST"

  smtp_port=$(get_env_value "SMTP_PORT")
  read -r -p "SMTP port [${smtp_port:-587}]: " SMTP_PORT
  SMTP_PORT=${SMTP_PORT:-${smtp_port:-587}}
  set_env_value "SMTP_PORT" "$SMTP_PORT"

  smtp_sender=$(get_env_value "SMTP_SENDER_EMAIL")
  read -r -p "SMTP sender email [${smtp_sender:-admin@${DOMAIN}}]: " SMTP_SENDER_EMAIL
  SMTP_SENDER_EMAIL=${SMTP_SENDER_EMAIL:-${smtp_sender:-admin@${DOMAIN}}}
  set_env_value "SMTP_SENDER_EMAIL" "$SMTP_SENDER_EMAIL"

  smtp_name=$(get_env_value "SMTP_SENDER_NAME")
  read -r -p "SMTP sender name [${smtp_name:-NoiseSentinel}]: " SMTP_SENDER_NAME
  SMTP_SENDER_NAME=${SMTP_SENDER_NAME:-${smtp_name:-NoiseSentinel}}
  set_env_value "SMTP_SENDER_NAME" "$SMTP_SENDER_NAME"

  smtp_pass_current=$(get_env_value "SMTP_APP_PASSWORD")
  while true; do
    read -r -s -p "SMTP app password (hidden, leave blank to keep current): " SMTP_APP_PASSWORD
    echo
    if [[ -n "$SMTP_APP_PASSWORD" ]]; then
      set_env_value "SMTP_APP_PASSWORD" "$SMTP_APP_PASSWORD"
      break
    elif [[ -n "$smtp_pass_current" ]]; then
      break
    else
      echo "SMTP app password is required."
    fi
  done

  smtp_ssl=$(get_env_value "SMTP_ENABLE_SSL")
  read -r -p "SMTP enable SSL [${smtp_ssl:-true}]: " SMTP_ENABLE_SSL
  SMTP_ENABLE_SSL=${SMTP_ENABLE_SSL:-${smtp_ssl:-true}}
  set_env_value "SMTP_ENABLE_SSL" "$SMTP_ENABLE_SSL"

  smtp_otp=$(get_env_value "SMTP_OTP_EXPIRATION_MINUTES")
  read -r -p "OTP expiration minutes [${smtp_otp:-15}]: " SMTP_OTP
  SMTP_OTP=${SMTP_OTP:-${smtp_otp:-15}}
  set_env_value "SMTP_OTP_EXPIRATION_MINUTES" "$SMTP_OTP"

  set_env_value "VITE_API_BASE_URL" "$VITE_API_BASE_URL"
fi

if [[ "$DOMAIN" != "noisesentinel.tech" ]]; then
  if [[ -f infra/caddy/Caddyfile ]]; then
    sed -i -E "s|noisesentinel\.tech, www\.noisesentinel\.tech|${DOMAIN}, www.${DOMAIN}|g" infra/caddy/Caddyfile
  fi
  if [[ -f src/NoiseSentinel.WebApi/Program.cs ]]; then
    sed -i -E "s|https://noisesentinel\.tech|https://${DOMAIN}|g" src/NoiseSentinel.WebApi/Program.cs
    sed -i -E "s|https://www\.noisesentinel\.tech|https://www.${DOMAIN}|g" src/NoiseSentinel.WebApi/Program.cs
  fi
  if [[ -f src/NoiseSentinel.BLL/Services/AuthService.cs ]]; then
    sed -i -E "s|https://noisesentinel\.tech/verify-email|https://${DOMAIN}/verify-email|g" src/NoiseSentinel.BLL/Services/AuthService.cs
  fi
fi

log "Building and starting containers"
$DOCKER compose up -d --build
$DOCKER compose ps

log "Deployment complete"
echo "Web portal: https://${DOMAIN}"
echo "API health: https://${DOMAIN}/api/health"

echo "If Azure SQL is used, allow this droplet IP in Azure SQL firewall rules."

if [[ "$NEED_RELOGIN" -eq 1 ]]; then
  warn "You were added to the docker group. Log out and back in to use docker without sudo."
fi
