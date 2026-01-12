# NPM Workspaces Monorepo - thegioicuongphim

Modern monorepo setup cho OTT streaming platform với React (client) và NestJS (server).

## 🏗️ Structure

```
thegioicuongphim/
├── client/          # React 19 + Tailwind + shadcn/ui
├── server/          # NestJS + Prisma + MySQL
├── package.json     # Root workspace config
└── .npmrc          # NPM configuration
```

## 🚀 Quick Start

```bash
# Install tất cả dependencies
npm install

# Dev mode (chạy cả client + server)
npm run dev

# Chạy riêng lẻ
npm run dev:client   # http://localhost:3000
npm run dev:server   # http://localhost:3006

# Build production
npm run build        # Build cả 2

# Lint
npm run lint

# Format code
npm run format
```

## 📦 Workspace Commands

```bash
# Chạy command trong specific workspace
npm run <script> -w client
npm run <script> -w server

# Chạy command trong TẤT CẢ workspaces
npm run <script> --workspaces
```

## 🗄️ Database (Prisma)

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## 🧹 Maintenance

```bash
# Clean build artifacts
npm run clean

# Clean và reinstall tất cả
npm run clean
npm run install:all
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev mode (client + server parallel) |
| `npm run dev:client` | Client dev server only |
| `npm run dev:server` | Server dev mode only |
| `npm run build` | Production build (server → client) |
| `npm run lint` | Lint all workspaces |
| `npm run format` | Format code with Prettier |
| `npm run clean` | Remove build artifacts |
| `npm run prisma:*` | Prisma utilities |

## 🌍 Environment Variables

### Client (.env)
```env
REACT_APP_API_URL=http://localhost:3006
```

### Server (.env)
```env
DATABASE_URL=mysql://user:pass@localhost:3306/db
JWT_SECRET=your-secret-key
PORT=3006
```

## 📚 Tech Stack

**Client:**
- React 19.2
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Redux Toolkit

**Server:**
- NestJS 11
- Prisma 6.19
- MySQL/MariaDB
- JWT Auth
- Bcrypt

## 🚢 Deployment

### Vercel (Client)
```bash
# Build command
cd client && npm install && npm run build

# Output directory
client/build
```

### VPS/Railway (Server)
```bash
cd server
npm ci --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start:prod
```

## 🔗 Links

- Client: http://localhost:3000
- Server API: http://localhost:3006
- Prisma Studio: http://localhost:5555

---

Made with ❤️ using npm workspaces
