use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cloister {
    pub id: String,
    pub title: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Presence {
    pub id: String,
    pub name: String,
    pub description: String,
    pub color: String,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Quote {
    pub source_message_id: String,
    pub source_presence_name: String,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageEditHistory {
    pub previous_content: String,
    pub edited_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub cloister_id: String,
    pub presence_id: String,
    pub content: String,
    pub quotes: Vec<Quote>,
    pub created_at: i64,
    pub updated_at: Option<i64>,
    pub edit_history: Option<Vec<MessageEditHistory>>,
    pub is_deleted: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportData {
    pub version: String,
    pub exported_at: i64,
    pub cloisters: Vec<Cloister>,
    pub presences: Vec<Presence>,
    pub messages: Vec<Message>,
}
