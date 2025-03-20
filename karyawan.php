<?php
require_once 'config/config.php';
requireLogin();

$karyawan = readJSON(KARYAWAN_JSON);
$message = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'add':
                $newKaryawan = [
                    'id' => 'EMP' . str_pad(count($karyawan['karyawan']) + 1, 3, '0', STR_PAD_LEFT),
                    'nama' => $_POST['nama'],
                    'jabatan' => $_POST['jabatan'],
                    'departemen' => $_POST['departemen'],
                    'tanggal_masuk' => $_POST['tanggal_masuk'],
                    'status' => 'aktif',
                    'alamat' => $_POST['alamat'],
                    'telepon' => $_POST['telepon'],
                    'email' => $_POST['email']
                ];
                $karyawan['karyawan'][] = $newKaryawan;
                writeJSON(KARYAWAN_JSON, $karyawan);
                $message = 'Karyawan berhasil ditambahkan!';
                break;

            case 'edit':
                foreach ($karyawan['karyawan'] as &$k) {
                    if ($k['id'] === $_POST['id']) {
                        $k['nama'] = $_POST['nama'];
                        $k['jabatan'] = $_POST['jabatan'];
                        $k['departemen'] = $_POST['departemen'];
                        $k['alamat'] = $_POST['alamat'];
                        $k['telepon'] = $_POST['telepon'];
                        $k['email'] = $_POST['email'];
                        break;
                    }
                }
                writeJSON(KARYAWAN_JSON, $karyawan);
                $message = 'Data karyawan berhasil diupdate!';
                break;

            case 'delete':
                $karyawan['karyawan'] = array_filter($karyawan['karyawan'], function($k) {
                    return $k['id'] !== $_POST['id'];
                });
                writeJSON(KARYAWAN_JSON, $karyawan);
                $message = 'Karyawan berhasil dihapus!';
                break;
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Karyawan - Sistem HR</title>
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

        .btn-danger {
            background: #dc3545;
            color: white;
        }

        .btn-danger:hover {
            background: #bb2d3b;
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

        .action-buttons {
            display: flex;
            gap: 0.5rem;
        }

        .message {
            padding: 1rem;
            border-radius: 5px;
            margin-bottom: 1rem;
        }

        .message-success {
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

        @media (max-width: 768px) {
            .table-responsive {
                overflow-x: auto;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <h1>Kelola Karyawan</h1>
        <a href="dashboard.php" class="btn btn-primary">
            <i class="fas fa-arrow-left"></i> Kembali
        </a>
    </nav>

    <div class="container">
        <?php if ($message): ?>
            <div class="message message-success">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>

        <div class="card">
            <button class="btn btn-primary" onclick="showAddModal()">
                <i class="fas fa-plus"></i> Tambah Karyawan
            </button>

            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nama</th>
                            <th>Jabatan</th>
                            <th>Departemen</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($karyawan['karyawan'] as $k): ?>
                            <tr>
                                <td><?php echo $k['id']; ?></td>
                                <td><?php echo $k['nama']; ?></td>
                                <td><?php echo $k['jabatan']; ?></td>
                                <td><?php echo $k['departemen']; ?></td>
                                <td><?php echo $k['status']; ?></td>
                                <td class="action-buttons">
                                    <button class="btn btn-primary" onclick="showEditModal('<?php echo htmlspecialchars(json_encode($k)); ?>')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <form method="POST" style="display: inline;" onsubmit="return confirm('Yakin ingin menghapus karyawan ini?');">
                                        <input type="hidden" name="action" value="delete">
                                        <input type="hidden" name="id" value="<?php echo $k['id']; ?>">
                                        <button type="submit" class="btn btn-danger">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Modal Tambah Karyawan -->
    <div id="addModal" class="modal">
        <div class="modal-content">
            <h2>Tambah Karyawan</h2>
            <form method="POST">
                <input type="hidden" name="action" value="add">
                
                <div class="form-group">
                    <label>Nama</label>
                    <input type="text" name="nama" required>
                </div>

                <div class="form-group">
                    <label>Jabatan</label>
                    <input type="text" name="jabatan" required>
                </div>

                <div class="form-group">
                    <label>Departemen</label>
                    <input type="text" name="departemen" required>
                </div>

                <div class="form-group">
                    <label>Tanggal Masuk</label>
                    <input type="date" name="tanggal_masuk" required>
                </div>

                <div class="form-group">
                    <label>Alamat</label>
                    <input type="text" name="alamat" required>
                </div>

                <div class="form-group">
                    <label>Telepon</label>
                    <input type="text" name="telepon" required>
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required>
                </div>

                <button type="submit" class="btn btn-primary">Simpan</button>
                <button type="button" class="btn btn-danger" onclick="hideModal('addModal')">Batal</button>
            </form>
        </div>
    </div>

    <!-- Modal Edit Karyawan -->
    <div id="editModal" class="modal">
        <div class="modal-content">
            <h2>Edit Karyawan</h2>
            <form method="POST">
                <input type="hidden" name="action" value="edit">
                <input type="hidden" name="id" id="editId">
                
                <div class="form-group">
                    <label>Nama</label>
                    <input type="text" name="nama" id="editNama" required>
                </div>

                <div class="form-group">
                    <label>Jabatan</label>
                    <input type="text" name="jabatan" id="editJabatan" required>
                </div>

                <div class="form-group">
                    <label>Departemen</label>
                    <input type="text" name="departemen" id="editDepartemen" required>
                </div>

                <div class="form-group">
                    <label>Alamat</label>
                    <input type="text" name="alamat" id="editAlamat" required>
                </div>

                <div class="form-group">
                    <label>Telepon</label>
                    <input type="text" name="telepon" id="editTelepon" required>
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" id="editEmail" required>
                </div>

                <button type="submit" class="btn btn-primary">Update</button>
                <button type="button" class="btn btn-danger" onclick="hideModal('editModal')">Batal</button>
            </form>
        </div>
    </div>

    <script>
        function showAddModal() {
            document.getElementById('addModal').style.display = 'flex';
        }

        function showEditModal(karyawan) {
            const data = JSON.parse(karyawan);
            document.getElementById('editId').value = data.id;
            document.getElementById('editNama').value = data.nama;
            document.getElementById('editJabatan').value = data.jabatan;
            document.getElementById('editDepartemen').value = data.departemen;
            document.getElementById('editAlamat').value = data.alamat;
            document.getElementById('editTelepon').value = data.telepon;
            document.getElementById('editEmail').value = data.email;
            document.getElementById('editModal').style.display = 'flex';
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