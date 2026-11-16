"""
Shared helpers for the integration tests.

Configuration comes from .env.local (the same MYSQL_* / MONGODB_* values the app uses), so the tests need no
extra setup. Optional overrides (environment variables):
  TEST_BASE_URL             app address, default http://127.0.0.1:3100
  TEST_MONGOD_STOP_CMD      shell command that stops MongoDB      } only needed for the MongoDB-outage
  TEST_MONGOD_START_CMD     shell command that starts it again    } checks in mongo_flow.py (skipped if unset)
"""
import os
import pymysql

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")


def _load_env():
    env = {}
    path = os.path.join(ROOT, ".env.local")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip()
    env.update({k: v for k, v in os.environ.items() if k.startswith(("MYSQL_", "MONGODB_", "TEST_"))})
    return env


ENV = _load_env()
BASE_URL = ENV.get("TEST_BASE_URL", "http://127.0.0.1:3100")
MONGO_URI = ENV.get("MONGODB_URI", "mongodb://127.0.0.1:27017")
MONGO_DB = ENV.get("MONGODB_DB", "canteenx")


def sql(query):
    """
    Runs ';'-separated statements with the app's own MySQL account and returns the rows of the last
    statement as lists of strings (NULL becomes 'NULL'). Errors are printed and give [].
    """
    rows = []
    try:
        conn = pymysql.connect(
            host=ENV.get("MYSQL_HOST", "127.0.0.1"),
            port=int(ENV.get("MYSQL_PORT", "3306")),
            user=ENV["MYSQL_USER"],
            password=ENV["MYSQL_PASSWORD"],
            database=ENV.get("MYSQL_DATABASE", "CanteenX"),
            autocommit=True,
        )
        try:
            with conn.cursor() as cur:
                for stmt in (s.strip() for s in query.split(";")):
                    if not stmt:
                        continue
                    cur.execute(stmt)
                    rows = list(cur.fetchall()) if cur.description else []
        finally:
            conn.close()
    except Exception as e:  # noqa: BLE001 - tests just report it
        print("SQL ERROR:", e)
        return []
    return [["NULL" if c is None else str(c) for c in row] for row in rows]
