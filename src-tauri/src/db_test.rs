#[cfg(test)]
mod tests {
    use crate::db::Database;
    use crate::models::{Cloister, Message, Presence, Quote};

    #[test]
    fn test_cloister_lifecycle() {
        let db = Database::new_in_memory().unwrap();
        let cloister = Cloister {
            id: "c1".to_string(),
            title: "Night Reflections".to_string(),
            created_at: 1000,
            updated_at: 1000,
        };
        db.insert_cloister(&cloister).unwrap();

        let list = db.get_cloisters().unwrap();
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].title, "Night Reflections");

        db.update_cloister("c1", "Deep Night Reflections", 2000).unwrap();
        let list_updated = db.get_cloisters().unwrap();
        assert_eq!(list_updated[0].title, "Deep Night Reflections");
        assert_eq!(list_updated[0].updated_at, 2000);

        db.delete_cloister("c1").unwrap();
        let list_empty = db.get_cloisters().unwrap();
        assert_eq!(list_empty.len(), 0);
    }

    #[test]
    fn test_presence_and_messages() {
        let db = Database::new_in_memory().unwrap();
        let c = Cloister {
            id: "c1".to_string(),
            title: "Cloister 1".to_string(),
            created_at: 1000,
            updated_at: 1000,
        };
        db.insert_cloister(&c).unwrap();

        let p1 = Presence {
            id: "p1".to_string(),
            name: "Rational".to_string(),
            description: "Analytic side".to_string(),
            color: "#3b82f6".to_string(),
            created_at: 1000,
        };
        let p2 = Presence {
            id: "p2".to_string(),
            name: "Emotional".to_string(),
            description: "Feeling side".to_string(),
            color: "#ec4899".to_string(),
            created_at: 1001,
        };
        db.insert_presence(&p1).unwrap();
        db.insert_presence(&p2).unwrap();

        let presences = db.get_presences().unwrap();
        assert_eq!(presences.len(), 2);

        // Send message
        let m1 = Message {
            id: "m1".to_string(),
            cloister_id: "c1".to_string(),
            presence_id: "p1".to_string(),
            content: "We need a structured way to look at this problem.".to_string(),
            quotes: vec![],
            created_at: 1005,
            updated_at: None,
            edit_history: Some(vec![]),
            is_deleted: false,
        };
        db.insert_message(&m1).unwrap();

        // Send message with quote
        let m2 = Message {
            id: "m2".to_string(),
            cloister_id: "c1".to_string(),
            presence_id: "p2".to_string(),
            content: "Structure might restrict our spontaneous feelings.".to_string(),
            quotes: vec![Quote {
                source_message_id: "m1".to_string(),
                source_presence_name: "Rational".to_string(),
                text: "structured way to look at this problem".to_string(),
            }],
            created_at: 1010,
            updated_at: None,
            edit_history: Some(vec![]),
            is_deleted: false,
        };
        db.insert_message(&m2).unwrap();

        let msgs = db.get_messages("c1").unwrap();
        assert_eq!(msgs.len(), 2);
        assert_eq!(msgs[1].quotes.len(), 1);
        assert_eq!(msgs[1].quotes[0].text, "structured way to look at this problem");

        // Edit message
        db.update_message_content("m1", "We definitely need a structured way.", 1020).unwrap();
        let msgs_edited = db.get_messages("c1").unwrap();
        assert_eq!(msgs_edited[0].content, "We definitely need a structured way.");
        let history = msgs_edited[0].edit_history.as_ref().unwrap();
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].previous_content, "We need a structured way to look at this problem.");

        // Search
        let search_res = db.search_messages("spontaneous").unwrap();
        assert_eq!(search_res.len(), 1);
        assert_eq!(search_res[0].id, "m2");

        // Delete message
        db.delete_message("m2").unwrap();
        let msgs_after_del = db.get_messages("c1").unwrap();
        assert_eq!(msgs_after_del[1].is_deleted, true);

        // Search should not return deleted message
        let search_after_del = db.search_messages("spontaneous").unwrap();
        assert_eq!(search_after_del.len(), 0);
    }
}
