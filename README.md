> Disclaimer: This app was vibe-coded for personal use. It might contain bugs etc.

# Todo App

A full-featured todo management application with GitHub authentication, built with Next.js 16, Drizzle ORM, and better-auth.

## Features

- ✅ **Authentication**: GitHub OAuth via better-auth
- ✅ **Access Control**: Optional email whitelist for restricted access
- ✅ **Create & Complete**: Simple todo management
- ✅ **Edit & Delete**: Full CRUD operations on todos
- ✅ **Due Dates**: Date-only due dates with overdue indicators
- ✅ **Categories**: Manage categories with database storage (CRUD)
- ✅ **Priorities**: High, medium, and low priority levels
- ✅ **Subtasks**: Parent-child todo relationships
- ✅ **Recurring Todos**: Auto-create new todos on completion
- ✅ **Notes**: Add text notes to todos
- ✅ **Filters**: Filter by category, priority, due date, and completion status
- ✅ **Mobile Responsive**: Simple, clean design that works on all devices
- ✅ **Docker Ready**: Easy deployment with Docker
- ✅ **TanStack Query**: Optimized data fetching with caching

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite with Drizzle ORM
- **Authentication**: better-auth with GitHub OAuth
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript

## Quick Start

### Prerequisites

- Node.js 24+
- pnpm (or npm/yarn)
- GitHub OAuth App credentials

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd todo
pnpm install
```

### 2. Set Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Todo App (or your choice)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your values:

```env
DATABASE_URL=file:./data/todo.db

# GitHub OAuth credentials from step 2
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Generate a random secret (run: openssl rand -base64 32)
BETTER_AUTH_SECRET=your_random_secret_here
BETTER_AUTH_URL=http://localhost:3000

# Optional: Restrict access to specific email addresses (comma-separated)
# If not set, all authenticated GitHub users can access the app
# Example: WHITELIST_EMAILS=user1@example.com,user2@example.com
WHITELIST_EMAILS=
```

### 4. Initialize Database

```bash
pnpm db:push
```

This creates the SQLite database and tables in `./data/todo.db`.

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with GitHub!

## Access Control (Optional)

By default, any user who can authenticate via GitHub OAuth can access the app. To restrict access to specific users, set the `WHITELIST_EMAILS` environment variable.

### How It Works

1. **Without whitelist**: All authenticated GitHub users can access the app
2. **With whitelist**: Only users whose GitHub email matches the whitelist can access

### Configuration

Add to your `.env.local`:

```env
# Single email
WHITELIST_EMAILS=john@example.com

# Multiple emails (comma-separated, no spaces)
WHITELIST_EMAILS=john@example.com,jane@example.com,admin@company.com
```

### Important Notes

- The email checked is the **primary email** from the user's GitHub account
- Email matching is **case-insensitive**
- If a non-whitelisted user tries to sign in, they will be redirected to the login page
- The whitelist is checked in `src/lib/auth.ts` during the authentication callback
- You can update the whitelist at any time by changing the environment variable and restarting the app

### Example Docker Deployment with Whitelist

```bash
docker run -d \
  -p 3000:3000 \
  -v /appdata/todo:/app/data \
  -e WHITELIST_EMAILS=alice@company.com,bob@company.com \
  -e GITHUB_CLIENT_ID=your_client_id \
  -e GITHUB_CLIENT_SECRET=your_client_secret \
  -e BETTER_AUTH_SECRET=your_secret \
  -e BETTER_AUTH_URL=http://your-server:3000 \
  --name todo-app \
  todo-app
```

## Docker Deployment

### Build Image

```bash
docker build -t todo-app .
```

### Run Container

```bash
docker run -d \
  -p 3000:3000 \
  -v /appdata/todo:/app/data \
  -e DATABASE_URL=file:./data/todo.db \
  -e GITHUB_CLIENT_ID=your_github_client_id \
  -e GITHUB_CLIENT_SECRET=your_github_client_secret \
  -e BETTER_AUTH_SECRET=your_random_secret \
  -e BETTER_AUTH_URL=http://your-nas-or-server:3000 \
  -e WHITELIST_EMAILS=user1@example.com,user2@example.com \
  --name todo-app \
  todo-app
```

**Important Notes:**

- The `-v /appdata/todo:/app/data` mounts your host's `/appdata/todo` directory to persist the SQLite database
- Update `BETTER_AUTH_URL` to match your server's URL
- Update the GitHub OAuth callback URL in your GitHub App settings to match your deployment URL
- Set `WHITELIST_EMAILS` to restrict access (optional, comma-separated list of email addresses)

### Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  todo:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - /appdata/todo:/app/data
    environment:
      - DATABASE_URL=file:./data/todo.db
      - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
      - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL}
      - WHITELIST_EMAILS=${WHITELIST_EMAILS}
    restart: unless-stopped
```

Then run:

```bash
docker-compose up -d
```

## Usage

### Creating Todos

1. Click **"+ New Todo"**
2. Fill in:
   - **Description** (required)
   - **Due Date** (optional)
   - **Category** (optional)
   - **Priority** (default: medium)
   - **Parent Todo** (optional, for subtasks)
   - **Notes** (optional)
   - **Repeat every X days** (optional, for recurring)
3. Click **"Create Todo"**

### Managing Todos

- **Complete**: Click the checkbox
- **View Subtasks**: Click the subtask count badge
- **Change Category**: Click the category badge and select a new one

### Filters

- **Category**: Filter by specific category or "No category"
- **Priority**: Filter by high, medium, or low
- **Due Date**: Overdue, today, this week, later, or no due date
- **Show Completed**: Toggle to show/hide completed todos

### Recurring Todos

When you complete a todo with a recurrence interval:

1. The original todo is marked complete
2. A new todo is automatically created
3. The new due date = original due date + interval days
4. All other fields (description, category, notes, priority) are copied

### Subtasks

1. Create a todo normally (this will be the parent)
2. Create another todo and select the parent from the "Parent Todo" dropdown
3. The parent will show a subtask count
4. Click the count to expand and view all subtasks
5. Subtasks always show (filters don't apply to them)

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate migrations
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Drizzle Studio (database GUI)

### Project Structure

```
todo/
├── categories.json              # Category configuration
├── Dockerfile                   # Docker setup
├── drizzle.config.ts           # Drizzle ORM config
├── src/
│   ├── actions/
│   │   └── todos.ts            # Server actions
│   ├── app/
│   │   ├── api/auth/           # Auth API routes
│   │   ├── login/              # Login page
│   │   └── page.tsx            # Main page
│   ├── components/             # React components
│   ├── db/
│   │   ├── index.ts            # Database connection
│   │   └── schema.ts           # Database schema
│   ├── lib/
│   │   ├── auth.ts             # better-auth config
│   │   ├── auth-client.ts      # Client auth utilities
│   │   ├── categories.ts       # Category helpers
│   │   ├── session.ts          # Session helpers
│   │   └── utils.ts            # Utility functions
│   └── types/
│       └── index.ts            # TypeScript types
└── data/                       # SQLite database (gitignored)
```

## Troubleshooting

### Database Issues

If you encounter database errors:

```bash
rm -rf data/
pnpm db:push
```

This will recreate the database from scratch.

### Authentication Issues

- Verify your GitHub OAuth App settings
- Check that the callback URL matches exactly
- Ensure `BETTER_AUTH_URL` matches your deployment URL
- Clear browser cookies and try again

### Docker Volume Permissions

If the container can't write to the database:

```bash
# On your host machine
sudo chown -R 1001:1001 /appdata/todo
```

## License

MIT
