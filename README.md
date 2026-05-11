# SHINERVA - AI Text-to-Speech Application

This is the fully packaged source code for the SHINERVA web application, ready to be self-hosted on a VPS (like Hostinger). It uses a Vite (React) frontend and a Node.js (Express) backend server.

## Project Structure

- `src/` & `index.html`: The Vite + React frontend code.
- `server.js`: The backend Express server. This serves your backend REST API (`/api/tts`, `/api/auth/login`), automatically handles Vite dev-mode middleware, and serves built static files in production.
- `package.json`: Contains all dependencies and scripts for both frontend and backend.
- `vite.config.js`: Vite build configuration.
- `.env.example`: A template for the environment variables the server can use.

## Prerequisites

- **Node.js** (v18 or newer recommended).
- **NPM** (Node Package Manager).
- **Hostinger VPS** running Ubuntu or another Linux distribution.

## Deployment Instructions (Hostinger VPS)

### 1. Transfer Files to Your Server
Export this project as a ZIP file from AI Studio.
Upload and extract the ZIP file onto your VPS (for example, into `/var/www/shinerva-app`).

### 2. Install Dependencies
SSH into your VPS, navigate to the project folder, and run:
```bash
cd /var/www/shinerva-app
npm install
```

### 3. Build the Frontend
To compile the Vite React app into static files:
```bash
npm run build
```
This generates a `dist/` directory, which `server.js` will automatically serve in production mode.

### 4. Configure Environment Variables
Copy the `.env.example` file to create a new `.env` file:
```bash
cp .env.example .env
```
Edit `.env` (using nano or vim) and set your variables.
- `NODE_ENV=production` must be set in your environment or PM2 config to ensure `server.js` serves the built `dist/` directory.
- `GOOGLE_API_KEY=YOUR_KEY` is required if you want the `/api/tts` endpoint to forward requests to Google Cloud TTS.

### 5. Start the Application
You can start the server manually for testing:
```bash
npm start
```

### 6. Keep It Running 24/7 (PM2)
To keep the server running after you close SSH:
```bash
sudo npm install -g pm2
pm2 start npm --name "shinerva" -- start
pm2 save
pm2 startup
```

### 7. Set Up Nginx Reverse Proxy (Optional but Recommended)
To expose this Node app to the public on port 80/443 (HTTP/HTTPS):
- Install Nginx: `sudo apt install nginx`
- Edit Nginx configuration (e.g. `sudo nano /etc/nginx/sites-available/default`) to proxy pass traffic to `http://localhost:3000`.
- Reload Nginx: `sudo systemctl reload nginx`.

## Customizing Auth/TTS
- `server.js` implements a backend API at `/api/tts` which securely proxies the request to the Google Speech API without exposing your API Key on the client.
- Auth endpoints `/api/auth/login` and `/api/auth/signup` are scaffolded awaiting DB hookup.
