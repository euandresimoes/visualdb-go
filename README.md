<div align="center">

<img width="1871" height="326" alt="Logo W Text" src="https://github.com/user-attachments/assets/ae70a45e-3bb4-4e8b-8be7-c2a2be547127" />

##
<br>

> **Database tools should be simple, portable, and predictable.**  

If Docker runs on your machine, Holo Studio runs too, Windows, macOS, or Linux,<br>always with the same experience

**Zero downloads • Zero installation • 100% Docker**

[🌐 Website](https://holostudio.vercel.app) • [📦 Repository](https://github.com/euandresimoes/holo-studio) • [🐳 Docker Page](https://hub.docker.com/r/holostudio/studio)
<br>
[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [🐳 Why Docker](#-why-docker) • [🧰 Usage](#-how-to-use)

</div>

<br>

## 🐳 Why Docker?

### ❌ Traditional database tools

- OS-specific installers
- Dependency and compatibility issues
- Manual updates and patches
- System-level permissions required
- Inconsistent experience across platforms

### ✅ Holo Studio

- Single Docker command to start
- Works anywhere Docker runs
- Simple updates with `docker pull`
- Runs fully isolated in a container
- Works fully offline
- **Identical experience on every system**

<br>

## ✨ Key Benefits

| Benefit | Description |
|-------|------------|
| 🚫 Zero installation | No installers or host dependencies |
| ♻️ Consistent environment | Same setup on Windows, macOS, and Linux |
| 👥 Team-friendly | Share your `docker-compose.yml` with your team |
| 🔄 Always up to date | Pull the latest image to update |
| 🔐 Secure & isolated | Runs in its own Docker container |
| ⚡ Lightweight | Start when needed, stop when not |

<br>

## 🧩 Features

Everything you need to manage databases in one clean, modern interface.

### 🗂️ Schema Explorer

- Tree-based schema navigation
- Explore tables, views, and relationships

### 📊 Table Viewer

- Spreadsheet-like table interface
- Sorting, filtering, and pagination
- Efficient handling of large datasets

### ✏️ Edit Rows

- Inline editing with double-click
- Save changes instantly

### 🗑️ Delete Records

- Safe deletion with confirmation dialogs
- Bulk delete multiple rows at once

### 🧠 SQL Editor

- SQL editor with syntax highlighting
- Instant query execution
- Live result preview

### 📤 Export to CSV

- Export tables or query results
- Compatible with Excel, Google Sheets, and analytics tools

<br>

## 🛢️ Supported Databases

### ✅ Available now

- **PostgreSQL** (full support for all data types)

### 🚧 Coming soon

- MySQL
- SQLite
- MongoDB

<br>

## 🚀 Quick Start

Start Holo Studio in seconds:

```bash
docker run -p 23806:23806 holostudio/studio:latest
```

Then open your browser at:

```
http://localhost:23806
```

No sign-up. No configuration wizard. Just start exploring your database.

<br>

## 🧰 How to Use

### ▶️ Docker Run (quick)

Perfect for quick testing or connecting to an existing database.

```bash
docker run -d \
  --name holostudio \
  -p 23806:23806 \
  -e DB_TYPE=postgres \
  -e DB_USER=myuser \
  -e DB_PASSWORD=mypassword \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_NAME=mydb \
  -e SSL_MODE=disable \
  holostudio/studio:latest
```

<br>

### 🧱 Docker Compose (full stack)

Ideal for setting up a complete local development environment.

```yaml
services:
  pg:
    image: postgres:latest
    environment:
      - POSTGRES_USER=pg_user
      - POSTGRES_PASSWORD=pg_pwd
      - POSTGRES_DB=pg_db
    ports:
      - 5432:5432
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pg_user -d pg_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  holo:
    image: holostudio/studio:latest
    ports:
      - 23806:23806
    environment:
      - DB_TYPE=postgres
      - DB_USER=pg_user
      - DB_PASSWORD=pg_pwd
      - DB_HOST=pg
      - DB_PORT=5432
      - DB_NAME=pg_db
      - SSL_MODE=disable
    depends_on:
      pg:
        condition: service_healthy

volumes:
  pgdata:
```

Then open:

```
http://localhost:23806
```

---

<div align="center">

✨ **Holo Studio** — Database management, the Docker way.

</div>

