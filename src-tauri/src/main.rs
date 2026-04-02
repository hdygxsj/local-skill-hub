#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::Command;
use std::thread;
use std::time::Duration;
use std::sync::{Arc, Mutex};
use tauri::Manager;

fn main() {
    // Start easy-skills serve in background
    let child = Command::new("easy-skills")
        .arg("serve")
        .spawn()
        .expect("failed to start easy-skills serve");

    let backend = Arc::new(Mutex::new(Some(child)));
    let backend_clone = backend.clone();

    // Wait for server to start
    thread::sleep(Duration::from_secs(2));

    tauri::Builder::default()
        .setup(move |app| {
            let window = app.get_webview_window("main").unwrap();
            let backend = backend_clone.clone();
            
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { .. } = event {
                    if let Ok(mut guard) = backend.lock() {
                        if let Some(mut c) = guard.take() {
                            let _ = c.kill();
                        }
                    }
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
