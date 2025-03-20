<?php
require_once 'config/config.php';
requireLogin();

$karyawan = readJSON(KARYAWAN_JSON);
$gaji = readJSON(GAJI_JSON);

$totalKaryawan = count($karyawan['karyawan']);
$totalGaji = array_sum(array_column($gaji['gaji'], 'total'));
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Sistem HR</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            min-height: 100vh;
            background: #f5f5f5;
        }

        .navbar {
            background: linear-gradient(135deg, #20B2AA 0%, #3CB371 100%);
            padding: 1rem 2rem;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .navbar h1 {
            font-size: 1.5rem;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .logout-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            padding: 0.5rem 1rem;
            color: white;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s ease;
        }

        .logout-btn:hover {
            background: rgba(255,255,255,0.3);
        }

        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }

        .dashboard-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .stat-card h3 {
            color: #20B2AA;
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }

        .stat-card .value {
            font-size: 1.8rem;
            font-weight: bold;
            color: #333;
        }

        .quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
        }

        .action-card {
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            text-align: center;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .action-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .action-card i {
            font-size: 2rem;
            color: #20B2AA;
            margin-bottom: 1rem;
        }

        .action-card h3 {
            color: #333;
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
        }

        .action-card p {
            color: #666;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .navbar {
                padding: 1rem;
            }

            .container {
                margin: 1rem auto;
            }

            .stat-card .value {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <h1>Sistem HR</h1>
        <div class="user-info">
            <span>Welcome, <?php echo $_SESSION['name']; ?></span>
            <a href="logout.php" class="logout-btn">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        </div>
    </nav>

    <div class="container">
        <div class="dashboard-stats">
            <div class="stat-card">
                <h3>Total Karyawan</h3>
                <div class="value"><?php echo $totalKaryawan; ?></div>
            </div>
            <div class="stat-card">
                <h3>Total Pengeluaran Gaji</h3>
                <div class="value"><?php echo formatRupiah($totalGaji); ?></div>
            </div>
            <div class="stat-card">
                <h3>Karyawan Aktif</h3>
                <div class="value"><?php echo $totalKaryawan; ?></div>
            </div>
        </div>

        <div class="quick-actions">
            <a href="karyawan.php" class="action-card">
                <i class="fas fa-users"></i>
                <h3>Kelola Karyawan</h3>
                <p>Tambah, edit, atau hapus data karyawan</p>
            </a>
            <a href="gaji.php" class="action-card">
                <i class="fas fa-money-bill-wave"></i>
                <h3>Kelola Gaji</h3>
                <p>Atur dan proses penggajian karyawan</p>
            </a>
            <a href="laporan.php" class="action-card">
                <i class="fas fa-chart-bar"></i>
                <h3>Laporan</h3>
                <p>Lihat laporan dan statistik</p>
            </a>
            <a href="pengaturan.php" class="action-card">
                <i class="fas fa-cog"></i>
                <h3>Pengaturan</h3>
                <p>Atur sistem dan preferensi</p>
            </a>
        </div>
    </div>
</body>
</html>