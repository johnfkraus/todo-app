-- Run this once against your local SQL Server instance.
-- Adjust the password / login if you already have one.
--   YourStr0ngP@ss123

-- Optional: create a dedicated SQL login (skip if you use 'sa' or an existing login)
-- IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = N'todo_user')
-- BEGIN
--     CREATE LOGIN todo_user WITH PASSWORD = N'YourStrong@Passw0rd';
-- END
-- GO

SELECT * FROM sys.sql_logins

DELETE FROM sys.sql_logins where name = 'todo_user'

CREATE or replace LOGIN todo_user WITH PASSWORD = N'YourStr0ngP@ss123';


USE [YourDatabaseName];
GO

DROP USER todo_user;
GO

USE [master];
GO

DROP LOGIN todo_user;
GO

IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = N'todo_user')
BEGIN
    CREATE LOGIN todo_user WITH PASSWORD = N'YourStr0ngP@ss123';
END
GO




SELECT DB_NAME() AS CurrentDatabase;

SELECT session_id, DB_NAME(database_id) AS CurrentDatabase, login_name
FROM sys.dm_exec_sessions
WHERE session_id = @@SPID;

SELECT @@SERVERNAME AS [ServerInstanceName];

SELECT 
    CAST(SERVERPROPERTY('MachineName') AS VARCHAR(50)) AS [HostMachine],
    CAST(SERVERPROPERTY('InstanceName') AS VARCHAR(50)) AS [InstanceName],
    CAST(SERVERPROPERTY('ServerName') AS VARCHAR(50)) AS [FullServerInstance],
    CAST(SERVERPROPERTY('Edition') AS VARCHAR(50)) AS [Edition],
    CAST(SERVERPROPERTY('ProductVersion') AS VARCHAR(50)) AS [Version];


SELECT 
    local_net_address AS [ServerIP],
    local_tcp_port AS [Port],
    client_net_address AS [YourClientIP]
FROM sys.dm_exec_connections
WHERE session_id = @@SPID;


IF DB_ID(N'TodoDb') IS NULL
BEGIN
    CREATE DATABASE TodoDb;
END
GO

USE TodoDb;
GO

-- Give the app login access to this database only
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'todo_user')
BEGIN
    CREATE USER todo_user FOR LOGIN todo_user;
    ALTER ROLE db_datareader ADD MEMBER todo_user;
    ALTER ROLE db_datawriter ADD MEMBER todo_user;
END
GO

IF OBJECT_ID(N'dbo.TodoItems', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TodoItems (
        Id         INT IDENTITY(1,1) PRIMARY KEY,
        Title      NVARCHAR(200)  NOT NULL,
        IsComplete BIT            NOT NULL CONSTRAINT DF_TodoItems_IsComplete DEFAULT (0),
        RowVersion  ROWVERSION
    );
END
GO

-- A few starter rows (optional)
IF NOT EXISTS (SELECT 1 FROM dbo.TodoItems)
BEGIN
    INSERT INTO dbo.TodoItems (Title, IsComplete)
    VALUES
        (N'Learn React + .NET', 0),
        (N'Set up SQL Server database', 1),
        (N'Wire up Swagger', 1);
END
GO
