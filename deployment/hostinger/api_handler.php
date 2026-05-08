<?php
/**
 * RUNGU.id - Backend API Handler (PHP Native)
 * Handles character quota validation and Google TTS Proxy.
 * 
 * DATABASE SCHEMA (MySQL):
 * CREATE TABLE users (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   email VARCHAR(255) NOT NULL,
 *   current_quota INT DEFAULT 10000,
 *   max_quota INT DEFAULT 10000,
 *   plan VARCHAR(50) DEFAULT 'Free'
 * );
 * INSERT INTO users (email, current_quota, max_quota, plan) VALUES ('user@example.com', 10000, 10000, 'Free');
 */

header('Content-Type: application/json');

// 1. DATABASE CONFIGURATION
$db_host = 'localhost';
$db_user = 'root'; // Ganti sesuai db user Hostinger
$db_pass = '';     // Ganti sesuai db password Hostinger
$db_name = 'rungu_db';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'error' => 'Database connection failed']));
}

// 2. GOOGLE AI API CONFIG
$google_api_key = 'YOUR_GOOGLE_AI_API_KEY'; // AMAN: Disimpan di server
$tts_url = "https://texttospeech.googleapis.com/v1/text:synthesize?key=" . $google_api_key;

// 3. HANDLE REQUEST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $text = $input['text'] ?? '';
    $voice = $input['voice'] ?? 'id-ID-Standard-A';
    $is_ssml = $input['is_ssml'] ?? false;
    $user_id = 1; // Dummy user ID, ganti dengan logic session login Anda

    if (empty($text)) {
        echo json_encode(['success' => false, 'error' => 'Naskah tidak boleh kosong']);
        exit;
    }

    $char_count = mb_strlen($text);

    // 4. CHECK QUOTA IN DATABASE
    $stmt = $conn->prepare("SELECT current_quota, max_quota FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();

    if (!$result) {
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit;
    }

    if ($result['current_quota'] < $char_count) {
        echo json_encode(['success' => false, 'error' => 'Kuota tidak mencukupi. Silakan upgrade paket Anda!']);
        exit;
    }

    // 5. CALL GOOGLE TTS API
    $payload = [
        'input' => $is_ssml ? ['ssml' => $text] : ['text' => $text],
        'voice' => [
            'languageCode' => 'id-ID',
            'name' => $voice
        ],
        'audioConfig' => [
            'audioEncoding' => 'MP3',
            'pitch' => 0,
            'speakingRate' => 1.0
        ]
    ];

    $ch = curl_init($tts_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    $status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status_code !== 200) {
        echo json_encode(['success' => false, 'error' => 'Google API Error. Code: ' . $status_code, 'raw' => $response]);
        exit;
    }

    $data = json_decode($response, true);
    $audio_base64 = $data['audioContent'];

    // 6. UPDATE QUOTA IN DATABASE
    $new_quota = $result['current_quota'] - $char_count;
    $update_stmt = $conn->prepare("UPDATE users SET current_quota = ? WHERE id = ?");
    $update_stmt->bind_param("ii", $new_quota, $user_id);
    $update_stmt->execute();

    // 7. RETURN SUCCESS
    // Di produksi, simpan base64 ke file .mp3 di server lalu kirim URL-nya
    // Untuk demo ini, kita kirimkan data URI
    echo json_encode([
        'success' => true,
        'audio_url' => 'data:audio/mp3;base64,' . $audio_base64,
        'remaining_quota' => $new_quota,
        'max_quota' => $result['max_quota']
    ]);
}
?>
