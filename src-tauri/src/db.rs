use rusqlite::{params, Connection, Result};
use crate::models::{Cloister, Message, MessageEditHistory, Presence, Quote};

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(path: &str) -> Result<Self> {
        let conn = Connection::open(path)?;
        let db = Database { conn };
        db.init()?;
        Ok(db)
    }

    pub fn new_in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        let db = Database { conn };
        db.init()?;
        Ok(db)
    }

    fn init(&self) -> Result<()> {
        // Enable WAL mode for performance & concurrency, and enforce foreign keys
        self.conn.execute_batch(
            "
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;
            "
        )?;

        self.conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS cloisters (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS presences (
                id TEXT PRIMARY KEY,
                cloister_id TEXT NOT NULL DEFAULT '',
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                color TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (cloister_id) REFERENCES cloisters(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                cloister_id TEXT NOT NULL,
                presence_id TEXT NOT NULL,
                content TEXT NOT NULL,
                quotes_json TEXT NOT NULL DEFAULT '[]',
                created_at INTEGER NOT NULL,
                updated_at INTEGER,
                edit_history_json TEXT NOT NULL DEFAULT '[]',
                is_deleted INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (cloister_id) REFERENCES cloisters(id) ON DELETE CASCADE,
                FOREIGN KEY (presence_id) REFERENCES presences(id) ON DELETE CASCADE
            );
            "
        )?;

        // Safe migration: check if presences table was created in older version without cloister_id
        let mut has_cloister_id = false;
        let mut pragma_stmt = self.conn.prepare("PRAGMA table_info(presences)")?;
        let columns = pragma_stmt.query_map([], |row| {
            let col_name: String = row.get(1)?;
            Ok(col_name)
        })?;
        for col in columns {
            if col? == "cloister_id" {
                has_cloister_id = true;
                break;
            }
        }
        if !has_cloister_id {
            self.conn.execute(
                "ALTER TABLE presences ADD COLUMN cloister_id TEXT NOT NULL DEFAULT ''",
                [],
            )?;
        }

        // Create indexes
        self.conn.execute_batch(
            "
            CREATE INDEX IF NOT EXISTS idx_presences_cloister_id ON presences(cloister_id);
            CREATE INDEX IF NOT EXISTS idx_messages_cloister_id ON messages(cloister_id);
            CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
            "
        )?;
        Ok(())
    }

    // --- Cloisters ---
    pub fn get_cloisters(&self) -> Result<Vec<Cloister>> {
        let mut stmt = self.conn.prepare("SELECT id, title, created_at, updated_at FROM cloisters ORDER BY updated_at DESC")?;
        let rows = stmt.query_map([], |row| {
            Ok(Cloister {
                id: row.get(0)?,
                title: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
            })
        })?;

        let mut cloisters = Vec::new();
        for r in rows {
            cloisters.push(r?);
        }
        Ok(cloisters)
    }

    pub fn insert_cloister(&self, cloister: &Cloister) -> Result<()> {
        self.conn.execute(
            "INSERT INTO cloisters (id, title, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
            params![cloister.id, cloister.title, cloister.created_at, cloister.updated_at],
        )?;
        Ok(())
    }

    pub fn update_cloister(&self, id: &str, title: &str, updated_at: i64) -> Result<()> {
        self.conn.execute(
            "UPDATE cloisters SET title = ?1, updated_at = ?2 WHERE id = ?3",
            params![title, updated_at, id],
        )?;
        Ok(())
    }

    pub fn delete_cloister(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM messages WHERE cloister_id = ?1", params![id])?;
        self.conn.execute("DELETE FROM presences WHERE cloister_id = ?1", params![id])?;
        self.conn.execute("DELETE FROM cloisters WHERE id = ?1", params![id])?;
        Ok(())
    }

    // --- Presences ---
    pub fn get_presences(&self, cloister_id: &str) -> Result<Vec<Presence>> {
        let mut stmt = self.conn.prepare("SELECT id, cloister_id, name, description, color, created_at FROM presences WHERE cloister_id = ?1 ORDER BY created_at ASC")?;
        let rows = stmt.query_map(params![cloister_id], |row| {
            Ok(Presence {
                id: row.get(0)?,
                cloister_id: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                color: row.get(4)?,
                created_at: row.get(5)?,
            })
        })?;

        let mut presences = Vec::new();
        for r in rows {
            presences.push(r?);
        }
        Ok(presences)
    }

    pub fn get_all_presences(&self) -> Result<Vec<Presence>> {
        let mut stmt = self.conn.prepare("SELECT id, cloister_id, name, description, color, created_at FROM presences ORDER BY created_at ASC")?;
        let rows = stmt.query_map([], |row| {
            Ok(Presence {
                id: row.get(0)?,
                cloister_id: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                color: row.get(4)?,
                created_at: row.get(5)?,
            })
        })?;

        let mut presences = Vec::new();
        for r in rows {
            presences.push(r?);
        }
        Ok(presences)
    }

    pub fn insert_presence(&self, presence: &Presence) -> Result<()> {
        self.conn.execute(
            "INSERT INTO presences (id, cloister_id, name, description, color, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![presence.id, presence.cloister_id, presence.name, presence.description, presence.color, presence.created_at],
        )?;
        Ok(())
    }

    pub fn update_presence(&self, id: &str, name: &str, description: &str, color: &str) -> Result<()> {
        self.conn.execute(
            "UPDATE presences SET name = ?1, description = ?2, color = ?3 WHERE id = ?4",
            params![name, description, color, id],
        )?;
        Ok(())
    }

    pub fn delete_presence(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM presences WHERE id = ?1", params![id])?;
        Ok(())
    }

    // --- Messages ---
    pub fn get_messages(&self, cloister_id: &str) -> Result<Vec<Message>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, cloister_id, presence_id, content, quotes_json, created_at, updated_at, edit_history_json, is_deleted 
             FROM messages WHERE cloister_id = ?1 ORDER BY created_at ASC"
        )?;

        let rows = stmt.query_map(params![cloister_id], |row| {
            let quotes_str: String = row.get(4)?;
            let quotes: Vec<Quote> = serde_json::from_str(&quotes_str).unwrap_or_default();
            let edit_history_str: String = row.get(7)?;
            let edit_history: Vec<MessageEditHistory> = serde_json::from_str(&edit_history_str).unwrap_or_default();
            let is_deleted_int: i32 = row.get(8)?;

            Ok(Message {
                id: row.get(0)?,
                cloister_id: row.get(1)?,
                presence_id: row.get(2)?,
                content: row.get(3)?,
                quotes,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
                edit_history: Some(edit_history),
                is_deleted: is_deleted_int != 0,
            })
        })?;

        let mut messages = Vec::new();
        for r in rows {
            messages.push(r?);
        }
        Ok(messages)
    }

    pub fn insert_message(&self, msg: &Message) -> Result<()> {
        let quotes_json = serde_json::to_string(&msg.quotes).unwrap_or_else(|_| "[]".to_string());
        let edit_history_json = serde_json::to_string(&msg.edit_history).unwrap_or_else(|_| "[]".to_string());

        self.conn.execute(
            "INSERT INTO messages (id, cloister_id, presence_id, content, quotes_json, created_at, updated_at, edit_history_json, is_deleted)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                msg.id,
                msg.cloister_id,
                msg.presence_id,
                msg.content,
                quotes_json,
                msg.created_at,
                msg.updated_at,
                edit_history_json,
                if msg.is_deleted { 1 } else { 0 }
            ],
        )?;

        // Update cloister updated_at
        self.conn.execute(
            "UPDATE cloisters SET updated_at = ?1 WHERE id = ?2",
            params![msg.created_at, msg.cloister_id],
        )?;

        Ok(())
    }

    pub fn update_message_content(&self, id: &str, new_content: &str, edited_at: i64) -> Result<()> {
        // Fetch existing message content and history
        let (old_content, history_str): (String, String) = self.conn.query_row(
            "SELECT content, edit_history_json FROM messages WHERE id = ?1",
            params![id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )?;

        let mut history: Vec<MessageEditHistory> = serde_json::from_str(&history_str).unwrap_or_default();
        history.push(MessageEditHistory {
            previous_content: old_content,
            edited_at,
        });
        let updated_history_json = serde_json::to_string(&history).unwrap_or_else(|_| "[]".to_string());

        self.conn.execute(
            "UPDATE messages SET content = ?1, updated_at = ?2, edit_history_json = ?3 WHERE id = ?4",
            params![new_content, edited_at, updated_history_json, id],
        )?;
        Ok(())
    }

    pub fn delete_message(&self, id: &str) -> Result<()> {
        self.conn.execute(
            "UPDATE messages SET is_deleted = 1 WHERE id = ?1",
            params![id],
        )?;
        Ok(())
    }

    pub fn search_messages(&self, query: &str) -> Result<Vec<Message>> {
        let pattern = format!("%{}%", query);
        let mut stmt = self.conn.prepare(
            "SELECT id, cloister_id, presence_id, content, quotes_json, created_at, updated_at, edit_history_json, is_deleted 
             FROM messages WHERE content LIKE ?1 AND is_deleted = 0 ORDER BY created_at DESC"
        )?;

        let rows = stmt.query_map(params![pattern], |row| {
            let quotes_str: String = row.get(4)?;
            let quotes: Vec<Quote> = serde_json::from_str(&quotes_str).unwrap_or_default();
            let edit_history_str: String = row.get(7)?;
            let edit_history: Vec<MessageEditHistory> = serde_json::from_str(&edit_history_str).unwrap_or_default();
            let is_deleted_int: i32 = row.get(8)?;

            Ok(Message {
                id: row.get(0)?,
                cloister_id: row.get(1)?,
                presence_id: row.get(2)?,
                content: row.get(3)?,
                quotes,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
                edit_history: Some(edit_history),
                is_deleted: is_deleted_int != 0,
            })
        })?;

        let mut messages = Vec::new();
        for r in rows {
            messages.push(r?);
        }
        Ok(messages)
    }

    pub fn get_all_messages(&self) -> Result<Vec<Message>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, cloister_id, presence_id, content, quotes_json, created_at, updated_at, edit_history_json, is_deleted 
             FROM messages ORDER BY created_at ASC"
        )?;

        let rows = stmt.query_map([], |row| {
            let quotes_str: String = row.get(4)?;
            let quotes: Vec<Quote> = serde_json::from_str(&quotes_str).unwrap_or_default();
            let edit_history_str: String = row.get(7)?;
            let edit_history: Vec<MessageEditHistory> = serde_json::from_str(&edit_history_str).unwrap_or_default();
            let is_deleted_int: i32 = row.get(8)?;

            Ok(Message {
                id: row.get(0)?,
                cloister_id: row.get(1)?,
                presence_id: row.get(2)?,
                content: row.get(3)?,
                quotes,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
                edit_history: Some(edit_history),
                is_deleted: is_deleted_int != 0,
            })
        })?;

        let mut messages = Vec::new();
        for r in rows {
            messages.push(r?);
        }
        Ok(messages)
    }

    pub fn clear_and_restore(&mut self, cloisters: &[Cloister], presences: &[Presence], messages: &[Message]) -> Result<()> {
        let tx = self.conn.transaction()?;

        // Temporarily disable foreign keys within transaction or clear in reverse child-parent dependency order
        tx.execute("DELETE FROM messages", [])?;
        tx.execute("DELETE FROM presences", [])?;
        tx.execute("DELETE FROM cloisters", [])?;

        for c in cloisters {
            tx.execute(
                "INSERT INTO cloisters (id, title, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
                params![c.id, c.title, c.created_at, c.updated_at],
            )?;
        }
        for p in presences {
            tx.execute(
                "INSERT INTO presences (id, cloister_id, name, description, color, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![p.id, p.cloister_id, p.name, p.description, p.color, p.created_at],
            )?;
        }
        for m in messages {
            let quotes_json = serde_json::to_string(&m.quotes).unwrap_or_else(|_| "[]".to_string());
            let edit_history_json = serde_json::to_string(&m.edit_history).unwrap_or_else(|_| "[]".to_string());
            tx.execute(
                "INSERT INTO messages (id, cloister_id, presence_id, content, quotes_json, created_at, updated_at, edit_history_json, is_deleted)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                params![
                    m.id,
                    m.cloister_id,
                    m.presence_id,
                    m.content,
                    quotes_json,
                    m.created_at,
                    m.updated_at,
                    edit_history_json,
                    if m.is_deleted { 1 } else { 0 }
                ],
            )?;
        }

        tx.commit()?;
        Ok(())
    }
}
