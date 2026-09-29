use serde::Serialize;
use std::{ fs::{ self }, path::Path };
use tauri::Emitter;

#[derive(Clone, Serialize)]
struct DownloadProgress {
    downloaded: u64,
    total: u64,
    percentage: f64,
    file_name: String,
}



fn validate_download_url(url: &str) -> Result<(), String> {
    let parsed = reqwest::Url::parse(url).map_err(|_| "invalid download URL".to_string())?;
    if parsed.scheme() != "https" {
        return Err("download URLs must use HTTPS".to_string());
    }
    if parsed.host_str().is_none() {
        return Err("download URL must include a host".to_string());
    }
    Ok(())
}

fn validate_destination(path: &Path) -> Result<(), String> {
    if !path.is_absolute() {
        return Err("destination path must be absolute".to_string());
    }
    if path.file_name().is_none() {
        return Err("destination path must include a filename".to_string());
    }
    Ok(())
}
pub fn download_file(url: &str, dest: &Path) -> Result<(), Box<dyn std::error::Error>> {
    validate_download_url(url).map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidInput, e))?;
    validate_destination(dest).map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidInput, e))?;

    if let Some(parent) = dest.parent() {
        fs::create_dir_all(parent)?;
    }
    let mut response = reqwest::blocking::get(url)?;
    if !response.status().is_success() {
        return Err(format!("failed to download file: status {}", response.status()).into());
    }
    let mut file = fs::File::create(dest)?;
    let content_length = response.content_length();

    let bytes_written = std::io::copy(&mut response, &mut file)?;
    if let Some(expected) = content_length {
        if bytes_written != expected {
            return Err(
                format!(
                    "couldn't complete download: expected {} bytes, got {} bytes",
                    expected,
                    bytes_written
                ).into()
            );
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn get_file_size(url: String) -> Result<u64, String> {
    validate_download_url(&url)?;
    use reqwest::{ header, redirect::Policy };

    let client = reqwest::Client
        ::builder()
        .redirect(Policy::limited(10))
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client
        .get(&url)
        .header(header::ACCEPT_ENCODING, "identity")
        .send().await
        .map_err(|e| e.to_string())?;

    if !resp.status().is_success() {
        return Err(format!("failed to get file size: status {}", resp.status()));
    }

    Ok(resp.content_length().unwrap_or(0))
}

#[tauri::command]
pub async fn delete_file(path: &str) -> Result<bool, String> {
    let file_path = std::path::PathBuf::from(path);
    validate_destination(&file_path)?;

    if !file_path.exists() {
        return Ok(false);
    }

    std::fs::remove_file(&file_path).map_err(|e| format!("Failed to delete file: {}", e))?;

    Ok(true)
}

#[tauri::command]
pub async fn download_file_command(
    url: String,
    dest: String,
    window: tauri::Window
) -> Result<(), String> {
    let dest_path = std::path::PathBuf::from(&dest);
    validate_download_url(&url)?;
    validate_destination(&dest_path)?;
    let file_name = dest_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    if let Some(parent) = dest_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let client = reqwest::Client::new();
    let mut response = client
        .get(&url)
        .send().await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("failed to download file: status {}", response.status()));
    }

    let total_size = response.content_length().unwrap_or(0);

    let mut file = tokio::fs::File::create(&dest_path).await.map_err(|e| e.to_string())?;

    let mut downloaded: u64 = 0;

    while let Some(chunk) = response.chunk().await.map_err(|e| e.to_string())? {
        tokio::io::AsyncWriteExt::write_all(&mut file, &chunk).await.map_err(|e| e.to_string())?;

        downloaded += chunk.len() as u64;

        let percentage = if total_size > 0 {
            ((downloaded as f64) / (total_size as f64)) * 100.0
        } else {
            0.0
        };

        let _ = window.emit("download-progress", DownloadProgress {
            downloaded,
            total: total_size,
            percentage,
            file_name: file_name.clone(),
        });
    }

    Ok(())
}
