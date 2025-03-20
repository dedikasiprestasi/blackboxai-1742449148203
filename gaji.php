<?php
require_once 'config/config.php';
requireLogin();

$karyawan = readJSON(KARYAWAN_JSON);
$gaji = readJSON(GAJI_JSON);
$message = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'add':
                $newGaji = [
                    'id' => 'SAL' . str_pad(count($gaji['gaji']) + 1, 3, '0', STR_PAD_LEFT),
                    'karyawan_id' => $_POST['karyawan_id'],
                    'gaji_pokok' => (int)$_POST['gaji_pokok'],
                    'tunjangan' => [
                        'transport' => (int)$_POST['tunjangan_transport'],
                        'makan' => (int)$_POST['tunjangan_makan'],
                        'kesehatan' => (int)$_POST['tunjangan_kesehatan']
                    ],
                    'potongan' => [
                        'bpjs' => (int)$_POST['potongan_bpjs'],
                        'pph21' => (int)$_POST['potongan_pph21']
                    ],
                    'total' => (int)$_POST['gaji_pokok'] + 
                              (int)$_POST['tunjangan_transport'] + 
                              (int)$_POST['tunjangan_makan'] + 
                              (int)$_POST['tunjangan_kesehatan'] - 
                              (int)$_POST['potongan_bpjs'] - 
                              (int)$_POST['potongan_pph21'],
                    'bulan' => $_POST['bulan'],
                    'status' => 'pending',
                    'tanggal_bayar' => null
                ];
                $gaji['gaji'][] = $newGaji;
                writeJSON(GAJI_JSON, $gaji);
                $message = 'Data gaji berhasil ditambahkan!';
                break;

            case 'bayar':
                foreach ($gaji['gaji'] as &$g) {
                    if ($g['id'] === $_POST['id']) {
                        $g['status'] = 'dibayar';
                        $g['tanggal_bayar'] = date('Y-m-d');
                        break;
                    }
                }
                writeJSON(GAJI_JSON, $gaji);
                $message = 'Gaji berhasil dibayarkan!';
                break;
        }
    }
}

function getKaryawanName($id) {
    global $karyawan;
    foreach ($karyawan['karyawan'] as $k) {
        if ($k['id'] === $id) {
            return $k['nama'];
        }
    }
    return 'Unknown';
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Gaji - Sistem HR</title>
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
        }

        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }

        .card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 1.5rem;
            margin-bottom: 2rem;
        }

        .btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.3s ease;
        }

        .btn-primary {
            background: #20B2AA;
            color: white;
        }

        .btn-primary:hover {
            background: #1a8f8a;
        }

        .btn-success {
            background: #28a745;
            color: white;
        }

        .btn-success:hover {
            background: #218838;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }

        th, td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #eee;
        }

        th {
            background: #f8f9fa;
            color: #333;
        }

        .message {
            padding: 1rem;
            border-radius: 5px;
            margin-bottom: 1rem;
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            align-items: center;
            justify-content: center;
        }

        .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            width: 100%;
            max-width: 500px;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #333;
        }

        .form-group input, .form-group select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 5px;
        }

        .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 3px;
            font-size: 0.875rem;
        }

        .status-pending {
            background: #ffeeba;
            color: #856404;
        }

        .status-dibayar {
            background: #d4edda;
            color: #155724;
        }

        @media (max-width: 768px) {
            .table-responsive {
                overflow-x: auto;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <h1>Kelola Gaji</h1>
        <a href="dashboard.php" class="btn btn-primary">
            <i class="fas fa-arrow-left"></i> Kembali
        </a>
    </nav>

    <div class="container">
        <?php if ($message): ?>
            <div class="message">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>

        <div class="card">
            <button class="btn btn-primary" onclick="showAddModal()">
                <i class="fas fa-plus"></i> Input Gaji
            </button>

            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nama Karyawan</th>
                            <th>Bulan</th>
                            <th>Gaji Pokok</th>
                            <th>Total Tunjangan</th>
                            <th>Total Potongan</th>
                            <th>Total Gaji</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($gaji['gaji'] as $g): ?>
                            <tr>
                                <td><?php echo $g['id']; ?></td>
                                <td><?php echo getKaryawanName($g['karyawan_id']); ?></td>
                                <td><?php echo $g['bulan']; ?></td>
                                <td><?php echo formatRupiah($g['gaji_pokok']); ?></td>
                                <td><?php echo formatRupiah(array_sum($g['tunjangan'])); ?></td>
                                <td><?php echo formatRupiah(array_sum($g['potongan'])); ?></td>
                                <td><?php echo formatRupiah($g['total']); ?></td>
                                <td>
                                    <span class="status-badge status-<?php echo $g['status']; ?>">
                                        <?php echo ucfirst($g['status']); ?>
                                    </span>
                                </td>
                                <td>
                                    <?php if ($g['status'] === 'pending'): ?>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('Yakin ingin membayar gaji ini?');">
                                            <input type="hidden" name="action" value="bayar">
                                            <input type="hidden" name="id" value="<?php echo $g['id']; ?>">
                                            <button type="submit" class="btn btn-success">
                                                <i class="fas fa-check"></i> Bayar
                                            </button>
                                        </form>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Modal Tambah Gaji -->
    <div id="addModal" class="modal">
        <div class="modal-content">
            <h2>Input Gaji</h2>
            <form method="POST">
                <input type="hidden" name="action" value="add">
                
                <div class="form-group">
                    <label>Karyawan</label>
                    <select name="karyawan_id" required>
                        <option value="">Pilih Karyawan</option>
                        <?php foreach ($karyawan['karyawan'] as $k): ?>
                            <option value="<?php echo $k['id']; ?>"><?php echo $k['nama']; ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="form-group">
                    <label>Bulan</label>
                    <input type="month" name="bulan" required>
                </div>

                <div class="form-group">
                    <label>Gaji Pokok</label>
                    <input type="number" name="gaji_pokok" required>
                </div>

                <div class="form-group">
                    <label>Tunjangan Transport</label>
                    <input type="number" name="tunjangan_transport" required>
                </div>

                <div class="form-group">
                    <label>Tunjangan Makan</label>
                    <input type="number" name="tunjangan_makan" required>
                </div>

                <div class="form-group">
                    <label>Tunjangan Kesehatan</label>
                    <input type="number" name="tunjangan_kesehatan" required>
                </div>

                <div class="form-group">
                    <label>Potongan BPJS</label>
                    <input type="number" name="potongan_bpjs" required>
                </div>

                <div class="form-group">
                    <label>Potongan PPH21</label>
                    <input type="number" name="potongan_pph21" required>
                </div>

                <button type="submit" class="btn btn-primary">Simpan</button>
                <button type="button" class="btn btn-danger" onclick="hideModal('addModal')">Batal</button>
            </form>
        </div>
    </div>

    <script>
        function showAddModal() {
            document.getElementById('addModal').style.display = 'flex';
        }

        function hideModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            if (event.target.className === 'modal') {
                event.target.style.display = 'none';
            }
        }
    </script>
</body>
</html>