CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DO $$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles 
      WHERE rolname = 'url_user') THEN
      
      CREATE USER url_user WITH PASSWORD 'url_password_123';
   END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE url_shortener TO url_user;
GRANT ALL ON SCHEMA public TO url_user;

ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';