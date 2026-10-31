# Todo App — React/Vite + .NET 8 + SQL Server (HTTPS everywhere)

A simple full-stack CRUD app:

- **Front end:** React + Vite + TypeScript, served over **HTTPS** at `https://localhost:5173`
- **Back end:** ASP.NET Core 8 Web API with **Swagger**, served over **HTTPS** at `https://localhost:5001`
- **Database:** SQL Server (`TodoDb`), accessed via Entity Framework Core

The React app calls `POST /api/todoitems` (and GET/PUT/DELETE) to add, edit, and remove items.

---

## Project layout

```text
todo-app/
├── TodoApi/                    # .NET 8 Web API
│   ├── Controllers/TodoItemsController.cs   # CRUD endpoints
│   ├── Models/TodoItem.cs
│   ├── Data/AppDbContext.cs    # EF Core DbContext
│   ├── Program.cs              # CORS, Swagger, HTTPS
│   ├── appsettings.json        # SQL Server connection string
│   └── Properties/launchSettings.json
├── sql/01_create_database.sql  # creates TodoDb + TodoItems table + app login
└── todo-frontend/              # React + Vite
    └── src/App.tsx, api.ts ... # UI + fetch calls
```

## Prerequisites (macOS)

- .NET 8 SDK: `brew install --cask dotnet-sdk` (or download from <https://dotnet.microsoft.com/download>)
- Node.js 18+: `brew install node`
- SQL Server already running on your machine (e.g., in Docker):
  `docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest`
- SQL client to run the setup script: Azure Data Studio, or `docker exec` + `sqlcmd`
- [mkcert](https://github.com/FiloSottile/mkcert) for a trusted localhost HTTPS cert for Vite

> **Note on Visual Studio:** Visual Studio for Mac was retired by Microsoft (support ended August 31, 2024). On a Mac, run the back end with the `dotnet` CLI and use **VS Code** (with the C# Dev Kit extension) or Cursor as your IDE. The full Visual Studio + IIS Express experience only exists on Windows.

## Opening and running in VS Code (macOS)

The project ships with a `.vscode/` folder (debug configs, tasks, extension recommendations), so opening it in VS Code gives you one-key run and debug for both halves of the stack.

### 1. Open the folder

```bash
code /path/to/todo-app
```

Open the **root `todo-app` folder** (not `TodoApi` or `todo-frontend` by themselves) — the debug configs reference both subfolders.

### 2. Install the recommended extensions

When you first open the folder, VS Code will prompt to install the recommended extensions — accept. If it doesn't, open the Extensions view (Cmd+Shift+X) and install:

- **C# Dev Kit** (`ms-dotnettools.csdevkit`) — intelliSense, debugging, and solution explorer for the .NET project
- Prettier (optional, for formatting)

### 3. Run the back end with F5 (run + debug)

1. Make sure the database exists and the connection string is configured (Steps 1–2 below, one-time).
2. Make sure the dev cert is trusted: `dotnet dev-certs https --trust`.
3. Go to the **Run and Debug** view (Cmd+Shift+D), pick **"TodoApi (.NET, https)"**, and press **F5**.

```text

Using launch settings from '/Users/blauerbock/workspaces/todo-app/TodoApi/Properties/launchSettings.json' [Profile 'https']...
You must install or update .NET to run this application.

App: /Users/blauerbock/workspaces/todo-app/TodoApi/bin/Debug/net8.0/TodoApi.dll
Architecture: arm64
Framework: 'Microsoft.NETCore.App', version '8.0.0' (arm64)
.NET location: /usr/local/share/dotnet/

The following frameworks were found:
  10.0.14 at [/usr/local/share/dotnet/shared/Microsoft.NETCore.App]

Learn more:
https://aka.ms/dotnet/app-launch-failed

To install missing framework, download:
https://aka.ms/dotnet-core-applaunch?framework=Microsoft.NETCore.App&framework_version=8.0.0&arch=arm64&rid=osx-arm64&os=osx.15
The target process exited without raising a CoreCLR started event. Ensure that the target process is configured to use .NET Core. This may be expected if the target process did not run on .NET Core.
The program '[1165] TodoApi.dll' has exited with code 150 (0x96).

```





This builds `TodoApi` (via the `build-api` task), starts it under the debugger using the `https` launch profile, and opens Swagger at `https://localhost:5001/swagger`. You can set breakpoints in `TodoItemsController.cs` and hit them by exercising the API from Swagger or the front end.

While it's running, the **debug toolbar** (top of the window) stops the API when you're done.

### 4. Run the front end

Open a terminal in VS Code (Ctrl+`):

```bash
cd todo-frontend
npm run dev
```

Then browse to `https://localhost:5173`. (The mkcert HTTPS cert from Step 4 below must already be in `todo-frontend/certs/`.)

Shortcut: Cmd+Shift+P → **Tasks: Run Task** → **dev-frontend** runs the Vite dev server in the background without a terminal.

### 5. Optional conveniences

- **Hot-reloading back end:** Tasks: Run Task → **watch-api** starts `dotnet watch run` — the API restarts automatically whenever you save a `.cs` file.
- **Debugging an already-running API:** pick **"Attach to .NET process"** in the Run and Debug view, then choose the `TodoApi` process.
- **Frontend debugging:** in Chrome, press F12 → Sources, or use the built-in "JavaScript Debugger" — VS Code's debugger auto-attaches to Vite. Breakpoints in `App.tsx` work directly.
- The **C# Dev Kit Solution Explorer** (bottom of the Explorer view) shows the project's files and lets you add NuGet packages via right-click.

### Typical daily loop

1. F5 (back end, with Swagger + debugging)
2. `npm run dev` in a terminal (front end)
3. Edit code, save, reload `https://localhost:5173` — API changes need `watch-api` or another F5 to pick up.

## Step 1 — Create the database

Run `sql/01_create_database.sql` against your SQL Server. With sqlcmd in Docker:

```bash
docker exec -i <container-name> /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd' -C \
  -i - < sql/01_create_database.sql
```

This creates the `TodoDb` database, the `TodoItems` table, and a least-privilege `todo_user` login. If you use `sa` or your own login instead, skip the login/user parts of the script and just use your credentials in the connection string.

## Step 2 — Configure the connection string

Edit `TodoApi/appsettings.json` (or better, keep secrets out of source control):

```bash
cd TodoApi
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Server=localhost,1433;Database=TodoDb;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;"
```

Connection string keys:

| Key | Meaning |
| --- | --- |
| `Server` | Host and port of SQL Server (`localhost,1433` for the Docker container) |
| `Database` | `TodoDb` (created by the SQL script) |
| `User Id` / `Password` | SQL auth credentials (`sa` or `todo_user`). On macOS you can't use Windows Integrated Auth, so SQL auth it is. |
| `TrustServerCertificate=True` | Needed for local SQL Server's self-signed TLS cert |

The app uses EF Core with a `Database.EnsureCreated`-free approach — the SQL script owns the schema, so no migrations are required.

## Step 3 — Run the .NET API (with Swagger)

```bash
cd TodoApi
dotnet dev-certs https --trust     # one-time: create/trust the ASP.NET Core dev cert
dotnet run --launch-profile https
```

The API starts on `https://localhost:5001`, and the browser opens **Swagger UI** at `https://localhost:5001/swagger`. Try `POST /api/todoitems` from there:

```json
{ "id": 0, "title": "Try the API from Swagger", "isComplete": false }
```

## Step 4 — Generate the Vite HTTPS certificate (one-time)

```bash
brew install mkcert
mkcert -install                       # adds a local CA to your macOS keychain
cd todo-frontend
mkdir -p certs
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost
```

## Step 5 — Run the React front end

```bash
cd todo-frontend
npm install
npm run dev
```

Open **`https://localhost:5173`**. You can add, edit (inline), toggle, and delete items — every operation is an HTTPS call to the .NET API, which reads/writes SQL Server.

### How the CORS / HTTPS wiring works

- The Vite dev server terminates TLS with your mkcert cert (trusted, so no browser warnings).
- The app calls `https://localhost:5001/api/todoitems` directly — the ASP.NET Core dev cert is trusted via `dotnet dev-certs https --trust`, so no cert errors.
- The API allows the origin `https://localhost:5173` via the CORS policy in `Program.cs`.
- Alternative: if you prefer no CORS at all, comment out the `https` block in `vite.config.ts` and enable the commented `proxy` block, then call relative `/api/...` URLs.

---

## Running behind IIS (the real answer for "IIS on macOS")

**You cannot run IIS on macOS** — IIS is a Windows-only component. Your options, closest first:

1. **Kestrel (recommended, what you already have):** ASP.NET Core's built-in web server is cross-platform and production-supported. The app above runs on Kestrel — `https://localhost:5001` is Kestrel serving TLS directly. For a "real server" feel on macOS, run Kestrel behind a reverse proxy:
   - **nginx** (brew install nginx) or **Caddy** in front of Kestrel, terminating HTTPS on port 443 and forwarding to the app.
2. **Windows VM (Parallels/VMware Fusion):** if you genuinely need IIS itself (e.g., to match a production deployment), run Windows 11 in a VM with IIS installed and publish the app there:

   ```powershell
   # on Windows
   dotnet publish -c Release -o ./publish
   # copy to IIS site folder, then in IIS Manager: create site, bind https:443,
   # install the .NET Hosting Bundle, app pool = "No Managed Code".
   ```

   ASP.NET Core on IIS requires the [Hosting Bundle](https://dotnet.microsoft.com/download) and the `AspNetCoreModuleV2`; the app itself runs Kestrel behind IIS as a reverse proxy (in-process or out-of-process).
3. **Docker (Windows containers):** also possible on Intel Macs with a Windows VM running Docker, but this is rarely worth the trouble.

So on your MacBook: Kestrel is the substitute you already have; the Swagger page opening on startup is handled by the `https` launch profile (`launchUrl: "swagger"`).

## API summary

| Method | URL | Purpose |
| --- | --- | --- |
| GET | `/api/todoitems` | list items |
| GET | `/api/todoitems/{id}` | get one |
| POST | `/api/todoitems` | add item |
| PUT | `/api/todoitems/{id}` | edit item |
| DELETE | `/api/todoitems/{id}` | remove item |

## Troubleshooting

- **Browser warning on the API cert:** run `dotnet dev-certs https --trust` (and on Chrome, restart it).
- **`Login failed for user` errors:** verify credentials and that `todo_user` was mapped in `TodoDb` (rerun the SQL script).
- **`Connection refused` on 1433:** SQL Server container isn't running — `docker ps` to check, `docker start <container>` if stopped.
- **CORS error in the browser console:** the front end must be served from exactly `https://localhost:5173` (the origin in `Program.cs`) and the API profile must be `https`.
- **SQL Server in Docker + ARM Mac:** use the `mcr.microsoft.com/azure-sql-edge` image if the 2022 SQL Server image won't run (Azure SQL Edge supports ARM64; note it lacks some SQL Server 2022 features but is fine for this app).
