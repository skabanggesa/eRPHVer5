// assets/js/admin/school-dashboard.js
// VERSI GOOGLE SHEETS - DASHBOARD PENUH BERKUASA

import { API_URL } from '../config.js';
import { logKeluar } from '../auth.js';

let dataPenggunaGlobal = []; // Simpan data asal pengguna
let dataLaporanRPH = [];     // Simpan data untuk laporan RPH mingguan

export async function loadSchoolAdminDashboard() {
    const container = document.getElementById('main-content');
    
    // 1. Dapatkan data Admin dari localStorage
    const userStr = localStorage.getItem('eRPH_User');
    if (!userStr) {
        logKeluar();
        return;
    }
    const adminData = JSON.parse(userStr);

    // 2. Bina Rangka UI Penuh (Statistik, Tab, Jadual, Modal)
    container.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; border: 1px solid #e2e8f0;">
            <div>
                <h2 style="margin:0; color:#1e293b; font-size:1.8rem;">👑 Pusat Kawalan Pentadbir</h2>
                <p style="margin:5px 0 0 0; color:#64748b;">Selamat datang, <strong>${adminData.nama}</strong></p>
            </div>
            <button id="btnLogoutAdmin" style="background:#ef4444; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold; box-shadow:0 4px 6px -1px rgba(239, 68, 68, 0.3);">Log Keluar</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
            <div style="background: linear-gradient(135deg, #4f46e5, #3b82f6); color:white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:0.9rem; opacity:0.9; font-weight:bold;">JUMLAH GURU</div>
                <div id="statJumlahGuru" style="font-size:2.5rem; font-weight:bold; margin-top:5px;">0</div>
            </div>
            <div style="background: linear-gradient(135deg, #10b981, #059669); color:white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:0.9rem; opacity:0.9; font-weight:bold;">JUMLAH PENYELIA</div>
                <div id="statJumlahPenyelia" style="font-size:2.5rem; font-weight:bold; margin-top:5px;">0</div>
            </div>
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color:white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:0.9rem; opacity:0.9; font-weight:bold;">TIADA PENYELIA</div>
                <div id="statTiadaPenyelia" style="font-size:2.5rem; font-weight:bold; margin-top:5px;">0</div>
            </div>
        </div>

        <div style="display:flex; gap:10px; margin-bottom:20px; border-bottom: 2px solid #e2e8f0; padding-bottom:10px;">
            <button id="tabPengguna" class="tab-btn active" style="background:#4f46e5; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">👥 Pengurusan Pengguna</button>
            <button id="tabLaporan" class="tab-btn" style="background:#f1f5f9; color:#475569; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">📊 Laporan RPH (Mingguan)</button>
        </div>

        <div id="kandunganPengguna" style="display:block;">
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                
                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:15px; margin-bottom: 20px; background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #cbd5e1;">
                    <div style="display:flex; gap:10px; flex-grow:1; max-width:600px;">
                        <input type="text" id="carianNama" placeholder="🔍 Cari nama atau emel guru..." style="flex-grow:1;">
                        <select id="tapisPeranan">
                            <option value="semua">Semua Peranan</option>
                            <option value="guru">Guru Sahaja</option>
                            <option value="penyelia">Penyelia Sahaja</option>
                        </select>
                    </div>
                    <button id="btnTambahGuru" style="background:#10b981; color:white; border:none; padding:10px 15px; border-radius:8px; cursor:pointer; font-weight:bold;">➕ Tambah Guru</button>
                </div>

                <div id="adminContent" style="overflow-x:auto;">
                    <div id="statusMuatTurun" style="text-align:center; padding:30px; color:#4f46e5; font-weight:bold; font-size:1.2rem;">
                        ⏳ Memuat turun pangkalan data sekolah...
                    </div>
                    </div>
            </div>
        </div>

        <div id="kandunganLaporan" style="display:none;">
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0; color:#1e293b;">Laporan Penghantaran RPH</h3>
                    <div>
                        <button id="btnRefreshLaporan" style="background:#3b82f6; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">🔄 Refresh Data</button>
                        <button id="btnCetakLaporan" style="background:#475569; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold; margin-left:10px;">🖨️ Cetak / PDF</button>
                    </div>
                </div>
                
                <div id="ruangLaporanAdmin" style="overflow-x:auto;">
                    <p style="text-align:center; color:#64748b;">Tekan 'Refresh Data' untuk menjana laporan RPH terkini bagi minggu ini.</p>
                </div>
            </div>
        </div>

        <div id="modalTambahGuru" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:1000; justify-content:center; align-items:center; backdrop-filter:blur(4px);">
            <div style="background:white; padding:30px; border-radius:12px; width:90%; max-width:500px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.2);">
                <h3 style="margin-top:0; color:#1e293b; border-bottom:2px solid #f1f5f9; padding-bottom:10px;">➕ Daftar Pengguna Baharu</h3>
                
                <div style="margin-bottom:15px; margin-top:20px;">
                    <label style="display:block; font-weight:bold; margin-bottom:5px; font-size:14px;">Nama Penuh:</label>
                    <input type="text" id="regNama" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px;" placeholder="Contoh: Ali bin Abu">
                </div>
                
                <div style="margin-bottom:15px;">
                    <label style="display:block; font-weight:bold; margin-bottom:5px; font-size:14px;">Emel (ID DELIMa / Rasmi):</label>
                    <input type="text" id="regEmel" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px;" placeholder="Contoh: g-123456@moe-dl.edu.my">
                </div>

                <div style="margin-bottom:15px;">
                    <label style="display:block; font-weight:bold; margin-bottom:5px; font-size:14px;">No. Kad Pengenalan:</label>
                    <input type="text" id="regIC" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px;" placeholder="Contoh: 801231145566 (Tanpa sempang)">
                    <small style="color:#64748b; font-size:12px;">Akan digunakan untuk menetapkan kata laluan log masuk.</small>
                </div>

                <div style="margin-bottom:25px;">
                    <label style="display:block; font-weight:bold; margin-bottom:5px; font-size:14px;">Peranan Pengguna:</label>
                    <select id="regPeranan" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px;">
                        <option value="Guru">Guru Biasa</option>
                        <option value="Penyelia">Penyelia</option>
                        <option value="Admin">Admin Sekolah</option>
                    </select>
                </div>

                <div style="text-align:right; border-top:1px solid #eee; padding-top:20px;">
                    <button id="btnSimpanGuruBaru" style="background:#10b981; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;">💾 Daftar Sekarang</button>
                    <button id="btnTutupModalGuru" style="background:#64748b; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; margin-left:10px; font-weight:bold;">Batal</button>
                </div>
            </div>
        </div>

    `;

    // 3. Bind Event Listeners
    document.getElementById('btnLogoutAdmin').addEventListener('click', logKeluar);
    
    // Fungsi Tab
    document.getElementById('tabPengguna').onclick = () => tukarTab('pengguna');
    document.getElementById('tabLaporan').onclick = () => tukarTab('laporan');

    // Fungsi Carian & Tapisan (Live)
    document.getElementById('carianNama').addEventListener('input', tapisJadualPengguna);
    document.getElementById('tapisPeranan').addEventListener('change', tapisJadualPengguna);

    // Fungsi Cetak
    document.getElementById('btnCetakLaporan').onclick = cetakLaporan;
    document.getElementById('btnRefreshLaporan').onclick = muatTurunLaporanRPH;

    // Fungsi Modal Tambah Guru
    document.getElementById('btnTambahGuru').onclick = tambahAtauEditGuru;
    document.getElementById('btnTutupModalGuru').onclick = () => {
        document.getElementById('modalTambahGuru').style.display = 'none';
    };
    document.getElementById('btnSimpanGuruBaru').onclick = simpanGuruBaru;

    // Daftarkan fungsi global untuk butang dalam jadual
    window.simpanPenyelia = simpanPenyelia;
    window.padamGuru = padamGuru;
    window.resetKatalaluan = resetKatalaluan;

    // 4. Muat Turun Data
    await muatTurunDataAdmin();
}

function tukarTab(tabName) {
    const tabP = document.getElementById('tabPengguna');
    const tabL = document.getElementById('tabLaporan');
    const kandP = document.getElementById('kandunganPengguna');
    const kandL = document.getElementById('kandunganLaporan');

    if (tabName === 'pengguna') {
        tabP.style.background = '#4f46e5'; tabP.style.color = 'white';
        tabL.style.background = '#f1f5f9'; tabL.style.color = '#475569';
        kandP.style.display = 'block';
        kandL.style.display = 'none';
    } else {
        tabL.style.background = '#4f46e5'; tabL.style.color = 'white';
        tabP.style.background = '#f1f5f9'; tabP.style.color = '#475569';
        kandL.style.display = 'block';
        kandP.style.display = 'none';
        if (dataLaporanRPH.length === 0) muatTurunLaporanRPH(); // Auto load jika kosong
    }
}

// =========================================================
// PENGURUSAN PENGGUNA (TAB 1)
// =========================================================

async function muatTurunDataAdmin() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getAdminData' })
        });
        const result = await response.json();

        if (result.success) {
            dataPenggunaGlobal = result.senaraiPengguna;
            kemaskiniStatistik(dataPenggunaGlobal);
            binaJadualPengguna(dataPenggunaGlobal);
        } else {
            document.getElementById('statusMuatTurun').innerText = "Ralat: " + result.message;
        }
    } catch (error) {
        document.getElementById('statusMuatTurun').innerText = "Gagal berhubung dengan pelayan.";
    }
}

function kemaskiniStatistik(data) {
    let jumGuru = 0;
    let jumPenyelia = 0;
    let tiadaPenyelia = 0;

    data.forEach(user => {
        if (!user.peranan.toLowerCase().includes('admin')) {
            jumGuru++;
            if (user.peranan.toLowerCase() === 'penyelia') jumPenyelia++;
            if (!user.emelPenyelia || user.emelPenyelia.trim() === "") tiadaPenyelia++;
        }
    });

    document.getElementById('statJumlahGuru').innerText = jumGuru;
    document.getElementById('statJumlahPenyelia').innerText = jumPenyelia;
    document.getElementById('statTiadaPenyelia').innerText = tiadaPenyelia;
}

function tapisJadualPengguna() {
    const kataKunci = document.getElementById('carianNama').value.toLowerCase();
    const peranan = document.getElementById('tapisPeranan').value.toLowerCase();

    const dataTapis = dataPenggunaGlobal.filter(user => {
        const matchNama = user.nama.toLowerCase().includes(kataKunci) || user.email.toLowerCase().includes(kataKunci);
        const matchPeranan = peranan === 'semua' ? true : user.peranan.toLowerCase() === peranan;
        return matchNama && matchPeranan;
    });

    binaJadualPengguna(dataTapis);
}

function binaJadualPengguna(data) {
    const container = document.getElementById('adminContent');
    const penyeliaList = dataPenggunaGlobal.filter(u => u.peranan.toLowerCase() === 'penyelia');

    let html = `
        <table style="width:100%; font-size:14px; text-align:left;">
            <thead>
                <tr>
                    <th width="30%">Nama Guru & Emel</th>
                    <th width="15%">Peranan</th>
                    <th width="30%">Ditetapkan Kepada Penyelia</th>
                    <th width="25%" style="text-align:center;">Tindakan</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach((user, index) => {
        // Abaikan admin utama dalam senarai ini
        if (user.peranan.toLowerCase().includes('admin')) return;

        let options = `<option value="">-- Tiada Penyelia (Sila Pilih) --</option>`;
        penyeliaList.forEach(p => {
            let selected = (user.emelPenyelia === p.email) ? 'selected' : '';
            options += `<option value="${p.email}" ${selected}>${p.nama}</option>`;
        });

        let perananLabel = user.peranan.toLowerCase() === 'penyelia' 
            ? `<span style="background:#dbeafe; color:#1e40af; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px;">Penyelia</span>` 
            : `<span style="background:#f1f5f9; color:#475569; padding:4px 8px; border-radius:4px; font-size:12px;">Guru</span>`;

        html += `
            <tr>
                <td>
                    <div style="font-weight:bold; color:#1e293b;">${user.nama}</div>
                    <div style="font-size:12px; color:#64748b;">${user.email}</div>
                </td>
                <td>${perananLabel}</td>
                <td>
                    <select id="selPenyelia_${index}" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1; font-size:13px; margin-bottom:5px;">
                        ${options}
                    </select>
                    <button onclick="window.simpanPenyelia('${user.email}', 'selPenyelia_${index}', this)" style="background:#10b981; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:12px; width:100%;">💾 Simpan Penyelia</button>
                </td>
                <td style="text-align:center; display:flex; gap:5px; justify-content:center; flex-wrap:wrap;">
                    <button onclick="window.resetKatalaluan('${user.email}')" title="Reset Kata Laluan" style="background:#f59e0b; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;">🔑 Reset</button>
                    <button onclick="window.padamGuru('${user.email}')" title="Padam Akaun" style="background:#ef4444; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;">🗑️ Padam</button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

async function simpanPenyelia(emailGuru, selectId, btnElement) {
    const emailPenyelia = document.getElementById(selectId).value;
    const teksAsal = btnElement.innerText;
    btnElement.innerText = "Menyimpan...";
    btnElement.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'updatePenyelia', emailGuru: emailGuru, emailPenyelia: emailPenyelia })
        });
        const result = await response.json();
        if (result.success) {
            btnElement.innerText = "✅ Berjaya";
            btnElement.style.background = "#059669";
            setTimeout(() => {
                btnElement.innerText = teksAsal;
                btnElement.style.background = "#10b981";
                btnElement.disabled = false;
            }, 2000);
            
            // Update local array supaya tak perlu download semula
            let user = dataPenggunaGlobal.find(u => u.email === emailGuru);
            if(user) user.emelPenyelia = emailPenyelia;
            kemaskiniStatistik(dataPenggunaGlobal);
            
        } else {
            alert("Gagal: " + result.message);
            btnElement.innerText = teksAsal;
            btnElement.disabled = false;
        }
    } catch (e) {
        alert("Ralat pelayan.");
        btnElement.innerText = teksAsal;
        btnElement.disabled = false;
    }
}

// ---------------------------------------------
// FUNGSI BACKEND (FASA 2 - AKTIF)
// ---------------------------------------------

async function padamGuru(emailTarget) {
    if(!confirm(`⚠️ AWAS: Anda pasti mahu memadam akaun guru [${emailTarget}]? Segala rekod login guru ini akan dipadam.`)) return;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'adminPadamUser', emailTarget: emailTarget })
        });
        const result = await response.json();
        
        if (result.success) {
            alert("✅ Akaun berjaya dipadam dari pangkalan data!");
            muatTurunDataAdmin(); // Segarkan semula jadual
        } else {
            alert("Gagal memadam: " + result.message);
        }
    } catch (e) {
        alert("Ralat sambungan pelayan.");
    }
}

async function resetKatalaluan(emailTarget) {
    if(!confirm(`Adakah anda mahu menetapkan semula kata laluan [${emailTarget}] kepada nombor IC / format asal?`)) return;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'adminResetUser', emailTarget: emailTarget })
        });
        const result = await response.json();
        
        if (result.success) {
            alert("✅ " + result.message);
        } else {
            alert("Gagal reset: " + result.message);
        }
    } catch (e) {
        alert("Ralat sambungan pelayan.");
    }
}

// FUNGSI BARU: Buka Borang Tambah Guru
function tambahAtauEditGuru() {
    // Kosongkan form
    document.getElementById('regNama').value = '';
    document.getElementById('regEmel').value = '';
    document.getElementById('regIC').value = '';
    document.getElementById('regPeranan').value = 'Guru';
    
    // Paparkan modal
    document.getElementById('modalTambahGuru').style.display = 'flex';
}

// FUNGSI BARU: Hantar Data ke Pelayan
async function simpanGuruBaru() {
    const nama = document.getElementById('regNama').value.trim();
    const email = document.getElementById('regEmel').value.trim();
    const ic = document.getElementById('regIC').value.trim();
    const peranan = document.getElementById('regPeranan').value;

    if (!nama || !email || !ic) {
        alert("Sila lengkapkan Nama Penuh, Emel, dan No. Kad Pengenalan.");
        return;
    }

    const btn = document.getElementById('btnSimpanGuruBaru');
    const teksAsal = btn.innerText;
    btn.innerText = "⏳ Sedang Mendaftar...";
    btn.disabled = true;

    try {
        // Kita guna 'action: register' yang telah sedia ada di Code.gs cikgu!
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                action: 'register', 
                nama: nama, 
                email: email, 
                ic: ic, 
                peranan: peranan 
            })
        });
        const result = await response.json();
        
        if (result.success) {
            alert("✅ " + result.message);
            document.getElementById('modalTambahGuru').style.display = 'none'; // Tutup modal
            
            // Tunjuk text loading dan muat turun semula data untuk refresh jadual
            document.getElementById('adminContent').innerHTML = `<div style="text-align:center; padding:30px; color:#4f46e5; font-weight:bold; font-size:1.2rem;">⏳ Memuat turun pangkalan data yang dikemaskini...</div>`;
            muatTurunDataAdmin(); 
        } else {
            alert("Gagal mendaftar: " + result.message);
        }
    } catch (e) {
        alert("Ralat sambungan ke pelayan.");
    } finally {
        btn.innerText = teksAsal;
        btn.disabled = false;
    }
}

// =========================================================
// LAPORAN RPH MINGGUAN (TAB 2 - AKTIF)
// =========================================================

async function muatTurunLaporanRPH() {
    const container = document.getElementById('ruangLaporanAdmin');
    container.innerHTML = `<div style="text-align:center; padding:30px; color:#3b82f6; font-weight:bold; font-size:1.1rem;">⏳ Menjana Laporan Keseluruhan RPH... Sila tunggu sebentar.</div>`;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'adminGetLaporanRPH' })
        });
        const result = await response.json();
        
        if (result.success) {
            dataLaporanRPH = result.data;
            
            let html = `
                <table style="width:100%; font-size:14px; text-align:left; border-collapse: collapse;">
                    <thead>
                        <tr style="background:#f8fafc; border-bottom:2px solid #cbd5e1;">
                            <th style="padding:12px;">Nama Guru</th>
                            <th style="padding:12px; text-align:center;">RPH Dijana</th>
                            <th style="padding:12px; text-align:center;">Dihantar</th>
                            <th style="padding:12px; text-align:center;">Disahkan</th>
                            <th style="padding:12px;">Status Guru</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            if(dataLaporanRPH.length === 0) {
                html += `<tr><td colspan="5" style="text-align:center; padding:20px;">Tiada rekod guru dijumpai.</td></tr>`;
            } else {
                dataLaporanRPH.forEach(guru => {
                    let statusLabel = "";
                    if (guru.jumlahDijana === 0) {
                        statusLabel = `<span style="background:#fee2e2; color:#ef4444; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px;">🔴 Kosong / Belum Mula</span>`;
                    } else if (guru.jumlahDihantar === 0 && guru.jumlahDisahkan === 0) {
                        statusLabel = `<span style="background:#fef3c7; color:#d97706; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px;">🟠 Draf (Belum Hantar)</span>`;
                    } else if (guru.jumlahDisahkan > 0) {
                        statusLabel = `<span style="background:#d1fae5; color:#10b981; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px;">🟢 Disahkan</span>`;
                    } else {
                        statusLabel = `<span style="background:#dbeafe; color:#3b82f6; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px;">🔵 Menunggu Semakan</span>`;
                    }

                    html += `
                        <tr style="border-bottom:1px solid #e2e8f0; background: white;">
                            <td style="padding:12px;">
                                <strong style="color:#1e293b;">${guru.nama}</strong><br>
                                <span style="font-size:12px; color:#64748b;">${guru.emel}</span>
                            </td>
                            <td style="padding:12px; text-align:center; font-weight:bold; color:#475569;">${guru.jumlahDijana}</td>
                            <td style="padding:12px; text-align:center; color:#3b82f6; font-weight:bold;">${guru.jumlahDihantar}</td>
                            <td style="padding:12px; text-align:center; color:#10b981; font-weight:bold;">${guru.jumlahDisahkan}</td>
                            <td style="padding:12px;">${statusLabel}</td>
                        </tr>
                    `;
                });
            }
            
            html += `</tbody></table>`;
            container.innerHTML = html;
            
        } else {
            container.innerHTML = `<div style="color:#ef4444; text-align:center; padding:20px;">Gagal: ${result.message}</div>`;
        }
    } catch (e) {
        container.innerHTML = `<div style="color:#ef4444; text-align:center; padding:20px;">Ralat sambungan ke pangkalan data Google. Sila cuba lagi.</div>`;
    }
}

function cetakLaporan() {
    const printWindow = window.open('', '_blank');
    let html = `
    <html>
    <head>
        <title>Cetak Laporan eRPH</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background-color: #f4f4f4; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h2 { margin: 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Laporan Penghantaran eRPH Mingguan</h2>
            <p>Tarikh Cetakan: ${new Date().toLocaleDateString('ms-MY')}</p>
        </div>
        `;
        
        // Memasukkan jadual sebenar dari skrin ke dalam fail cetakan
        html += document.getElementById('ruangLaporanAdmin').innerHTML;

        html += `
    </body>
    <script>window.print();</script>
    </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
}