🎯 VALORANT Live Daily Store Checker

A modern, fast, mobile-friendly, and secure VALORANT Daily Store Tracker web application.

View your daily 4 weapon skin offers, VP prices, remaining time, and in-game skin video previews live directly via official Riot Games OAuth authorization—without needing to launch the game client.
✨ Features

    🔒 100% Official & Secure: Powered by official riot-client OAuth credentials. Your password is never stored on third-party servers.

    ⚡ Automatic Clipboard Detection: After logging in on the Riot page, simply copy the URL from the address bar; returning to the tab will automatically load your store.

    📱 Mobile-First Design: Fully responsive interface tailored for desktop, tablet, and mobile (iOS / Android) screens.

    🎬 Live Video Previews: Watch level effects and finisher animations for every weapon skin directly inside a video modal.

    💎 VP Pricing & Rarity: Color effects and live VP costs mapped to skin rarity tiers.

    ⏱️ Live Countdown Timer: Track the remaining time until the 24-hour daily store reset in real-time.

    🌍 Automatic Region Resolution (PAS): Automatically detects Turkey, Europe (EU), North America (NA), Asia-Pacific (AP), and Korea (KR) servers.

🛠️ Built With

    Framework: Next.js 16 (App Router)

    UI & Icons: Tailwind CSS & Lucide React

    Language: TypeScript

    Data & API: Riot Games PvP Gateway & valorant-api.com

    Server / Deployment: Node.js, PM2, Nginx

🚀 Installation & Local Development
1. Clone the Repository
Bash

git clone https://github.com/your-username/valorant-store-app.git
cd valorant-store-app

2. Install Dependencies
Bash

npm install

3. Start the Development Server
Bash

npm run dev

Open http://localhost:3000 in your browser to start using the app!
📦 VPS Deployment

To run the application 24/7 on a Linux (Debian/Ubuntu) server:
Bash

# 1. Build the project
npm run build

# 2. Start in background with PM2
npm install -g pm2
pm2 start npm --name "valorant-store" -- start -- -p 3000
pm2 save
pm2 startup

📄 License

This project is licensed under the MIT License. It is not officially affiliated with Riot Games or VALORANT.
