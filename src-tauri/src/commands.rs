use tauri::State;
use crate::AppState;
use crate::models::{Cloister, ExportData, Message, Presence, Quote};

#[tauri::command]
pub fn get_cloisters(state: State<'_, AppState>) -> Result<Vec<Cloister>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_cloisters().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_cloister(state: State<'_, AppState>, title: String) -> Result<Cloister, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().timestamp_millis();
    let cloister = Cloister {
        id: uuid::Uuid::new_v4().to_string(),
        title,
        created_at: now,
        updated_at: now,
    };
    db.insert_cloister(&cloister).map_err(|e| e.to_string())?;
    Ok(cloister)
}

#[tauri::command]
pub fn update_cloister(state: State<'_, AppState>, id: String, title: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().timestamp_millis();
    db.update_cloister(&id, &title, now).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_cloister(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_cloister(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_presences(state: State<'_, AppState>, cloister_id: String) -> Result<Vec<Presence>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_presences(&cloister_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_presence(state: State<'_, AppState>, cloister_id: String, name: String, description: String, color: String) -> Result<Presence, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().timestamp_millis();
    let presence = Presence {
        id: uuid::Uuid::new_v4().to_string(),
        cloister_id,
        name,
        description,
        color,
        created_at: now,
    };
    db.insert_presence(&presence).map_err(|e| e.to_string())?;
    Ok(presence)
}

#[tauri::command]
pub fn update_presence(state: State<'_, AppState>, id: String, name: String, description: String, color: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.update_presence(&id, &name, &description, &color).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_presence(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_presence(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_messages(state: State<'_, AppState>, cloister_id: String) -> Result<Vec<Message>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_messages(&cloister_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn send_message(
    state: State<'_, AppState>,
    cloister_id: String,
    presence_id: String,
    content: String,
    quotes: Vec<Quote>,
) -> Result<Message, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().timestamp_millis();
    let message = Message {
        id: uuid::Uuid::new_v4().to_string(),
        cloister_id,
        presence_id,
        content,
        quotes,
        created_at: now,
        updated_at: None,
        edit_history: Some(vec![]),
        is_deleted: false,
    };
    db.insert_message(&message).map_err(|e| e.to_string())?;
    Ok(message)
}

#[tauri::command]
pub fn edit_message(state: State<'_, AppState>, id: String, content: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().timestamp_millis();
    db.update_message_content(&id, &content, now).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_message(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_message(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn search_messages(state: State<'_, AppState>, query: String) -> Result<Vec<(Message, String, String)>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let messages = db.search_messages(&query).map_err(|e| e.to_string())?;
    let cloisters = db.get_cloisters().map_err(|e| e.to_string())?;
    let presences = db.get_all_presences().map_err(|e| e.to_string())?;

    let cloister_map: std::collections::HashMap<String, String> = cloisters.iter().map(|c| (c.id.clone(), c.title.clone())).collect();
    let presence_map: std::collections::HashMap<String, String> = presences.iter().map(|p| (p.id.clone(), p.name.clone())).collect();

    Ok(messages.into_iter().map(|m| {
        let c_title = cloister_map.get(&m.cloister_id).cloned().unwrap_or_else(|| "Unknown".to_string());
        let p_name = presence_map.get(&m.presence_id).cloned().unwrap_or_else(|| "Unknown".to_string());
        (m, c_title, p_name)
    }).collect())
}

#[tauri::command]
pub fn export_json(state: State<'_, AppState>) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let cloisters = db.get_cloisters().map_err(|e| e.to_string())?;
    let presences = db.get_all_presences().map_err(|e| e.to_string())?;
    let messages = db.get_all_messages().map_err(|e| e.to_string())?;
    let data = ExportData {
        version: "0.2.0".to_string(),
        exported_at: chrono::Utc::now().timestamp_millis(),
        cloisters,
        presences,
        messages,
    };
    serde_json::to_string_pretty(&data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn export_jsonl(state: State<'_, AppState>) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let messages = db.get_all_messages().map_err(|e| e.to_string())?;
    let mut lines = Vec::new();
    for msg in messages {
        let json_line = serde_json::to_string(&msg).map_err(|e| e.to_string())?;
        lines.push(json_line);
    }
    Ok(lines.join("\n"))
}

#[tauri::command]
pub fn export_txt(state: State<'_, AppState>, cloister_id: Option<String>) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let presences = db.get_all_presences().map_err(|e| e.to_string())?;
    let presence_map: std::collections::HashMap<String, String> = presences
        .into_iter()
        .map(|p| (p.id, p.name))
        .collect();

    let messages = if let Some(cid) = cloister_id {
        db.get_messages(&cid).map_err(|e| e.to_string())?
    } else {
        db.get_all_messages().map_err(|e| e.to_string())?
    };

    let mut output = String::new();
    for msg in messages {
        if msg.is_deleted {
            continue;
        }
        let p_name = presence_map.get(&msg.presence_id).cloned().unwrap_or_else(|| "Unknown".to_string());
        let dt = chrono::DateTime::from_timestamp_millis(msg.created_at)
            .map(|d| d.format("%Y-%m-%d %H:%M:%S").to_string())
            .unwrap_or_default();

        output.push_str(&format!("[{}] {}\n", dt, p_name));
        for q in &msg.quotes {
            output.push_str(&format!("  > [{}] {}\n", q.source_presence_name, q.text));
        }
        output.push_str(&format!("{}\n\n", msg.content));
    }
    Ok(output)
}

#[tauri::command]
pub fn save_file_dialog(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn restore_json(state: State<'_, AppState>, json_content: String) -> Result<(), String> {
    let data: ExportData = serde_json::from_str(&json_content).map_err(|e| format!("Invalid JSON format: {}", e))?;
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.clear_and_restore(&data.cloisters, &data.presences, &data.messages).map_err(|e| e.to_string())?;
    Ok(())
}
