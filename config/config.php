<?php
session_start();

// Path ke file JSON
define('USERS_JSON', __DIR__ . '/../data/users.json');
define('KARYAWAN_JSON', __DIR__ . '/../data/karyawan.json');
define('GAJI_JSON', __DIR__ . '/../data/gaji.json');

// Fungsi untuk membaca file JSON
function readJSON($file) {
    if (file_exists($file)) {
        $jsonData = file_get_contents($file);
        return json_decode($jsonData, true);
    }
    return null;
}

// Fungsi untuk menulis ke file JSON
function writeJSON($file, $data) {
    $jsonData = json_encode($data, JSON_PRETTY_PRINT);
    return file_put_contents($file, $jsonData);
}

// Fungsi untuk mengecek login
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Fungsi untuk mengecek role admin
function isAdmin() {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

// Fungsi untuk redirect jika tidak login
function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit();
    }
}

// Fungsi untuk redirect jika bukan admin
function requireAdmin() {
    if (!isAdmin()) {
        header('Location: index.php');
        exit();
    }
}

// Format currency
function formatRupiah($angka) {
    return 'Rp ' . number_format($angka, 0, ',', '.');
}

// Format tanggal Indonesia
function formatTanggal($tanggal) {
    $bulan = array(
        1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    );
    $split = explode('-', $tanggal);
    return $split[2] . ' ' . $bulan[(int)$split[1]] . ' ' . $split[0];
}
?>