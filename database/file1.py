import sqlite3
import os

DATABASE_PATH = r"C:\Users\Admin\Desktop\Software project\db.db"

def init_db():
    os.makedirs("instance", exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()

    schema = open("db.sql").read()
    c.executescript(schema)

    conn.commit()
    conn.close()
    print("Database created successfully!")

if __name__ == "__main__":
    init_db()
