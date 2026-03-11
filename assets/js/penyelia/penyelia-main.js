/**
 * ==========================================================================================
 * MODUL UTAMA: DASHBOARD PENYELIA (VERSI GAS API & INTEGRASI SEMAKAN)
 * ==========================================================================================
 * Fail: assets/js/penyelia/penyelia-main.js
 */

import { API_URL } from '../config.js'; 

// IMPORT MODUL SEMAKAN DARI FAIL SEBELAH
import { initSemakRPH, loadSemakList } from './penyelia-semak.js';

// GLOBAL CACHE UNTUK NAMA GURU
window.teacherMap = {}; 

// ==========================================================================================
// 1. FUNGSI UTILITI (LOGOUT & NAVIGASI)
// ==========================================================================================

window.keluarSistem = () => {
    if (confirm("Adakah anda pasti mahu log keluar dari Sistem eRPH?")) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    }
};

window.tukarKeModGuru = function() {
    const msg = "Anda akan beralih ke paparan Guru untuk membina RPH anda sendiri.\n\nKlik OK untuk teruskan.";
    
    if(confirm(msg)) {
        let userStr = localStorage.getItem('eRPH_User');
        if(userStr) {
            let user = JSON.parse(userStr);
            user.role = 'guru'; 
            localStorage.setItem('eRPH_User', JSON.stringify(user));
        }
        
        // 1. TINGGALKAN JEJAK RAHSIA
        localStorage.setItem('asalPenyelia', 'ya');
        
        // 2. Tukar role dan refresh
        localStorage.setItem('userRole', 'guru');
        window.location.reload();
    }
};

// ==========================================================================================
// 2. FUNGSI UTAMA: MEMUATKAN DASHBOARD
// ==========================================================================================

export async function loadPenyeliaDashboard() {
    const container = document.getElementById('main-content');
    if (!container) return;

    // Paparan Loading Awal
    container.innerHTML = `
        <div style="display:flex; height:80vh; justify-content:center; align-items:center; flex-direction:column;">
            <div style="width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #4f46e5; border-radius:50%; animation:spin 1s linear infinite;"></div>
            <p style="margin-top:15px; color:#64748b; font-weight:500;">Memuatkan Profil Penyelia & Data Guru...</p>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
    `;

    const userStr = localStorage.getItem('eRPH_User');
    if(!userStr) { window.location.reload(); return; }
    const user = JSON.parse(userStr);

    window.refreshDashboardPenyelia = loadPenyeliaDashboard;

    // DAPATKAN SENARAI GURU (TEACHER MAP)
    try {
        const adminResp = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getAdminData' })
        });
        const adminRes = await adminResp.json();
        
        if (adminRes.success) {
            adminRes.senaraiPengguna.forEach(u => {
                if (u.email) window.teacherMap[u.email.toLowerCase()] = u.nama;
            });
        }
    } catch(e) {
        console.warn("Gagal mendapatkan pemetaan nama guru:", e);
    }

    let penyeliaName = user.nama || "Penyelia";

    // BINA ANTARAMUKA (UI) DASHBOARD
    container.innerHTML = `
        <style>
            .dashboard-container { padding: 30px; max-width: 1400px; margin: 0 auto; font-family: 'Segoe UI', sans-serif; }
            .header-box { display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            .user-info h1 { margin: 0; font-size: 1.5rem; color: #1e293b; }
            .user-info p { margin: 5px 0 0; color: #64748b; font-size: 0.9rem; }
            .btn-nav { padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; font-size: 0.9rem; }
            .btn-blue { background: #e0e7ff; color: #4338ca; }
            .btn-red { background: #fee2e2; color: #991b1b; }
            
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 35px; }
            .stat-card { background: white; padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: transform 0.2s; }
            .stat-card:hover { transform: translateY(-3px); }
            .stat-title { font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
            .stat-value { font-size: 2.8rem; font-weight: 800; color: #0f172a; line-height: 1; }
            .stat-desc { margin-top: 10px; font-size: 0.85rem; color: #4f46e5; font-weight: 600; cursor: pointer; }
            
            .table-section { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0; }
            .table-header { padding: 20px 25px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 15px 25px; font-size: 0.75rem; color: #64748b; text-transform: uppercase; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
            td { padding: 16px 25px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 0.9rem; }
            
            .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
            .bg-pending { background: #fff7ed; color: #c2410c; }
            .bg-success { background: #f0fdf4; color: #15803d; }
            .bg-draf { background: #f1f5f9; color: #475569; }
        </style>

        <div class="dashboard-container">
            <div class="header-box">
                <div class="user-info">
                    <h1>${penyeliaName}</h1>
                    <p>📧 ${user.email}</p>
                </div>
                <div style="display:flex; gap:10px;">
                    <button onclick="window.tukarKeModGuru()" class="btn-nav btn-blue">Mod Guru</button>
                    <button onclick="window.keluarSistem()" class="btn-nav btn-red">Log Keluar</button>
                </div>
            </div>

            <div id="view-dashboard-overview">
                <div class="stats-grid">
                    <div class="stat-card" id="card-trigger-semak" style="border-left: 5px solid #f59e0b; cursor: pointer;">
                        <div class="stat-title">Menunggu Semakan</div>
                        <div class="stat-value" id="stat-pending">0</div>
                        <div class="stat-desc">Klik untuk proses semakan →</div>
                    </div>
                    <div class="stat-card" style="border-left: 5px solid #10b981;">
                        <div class="stat-title">RPH Disahkan</div>
                        <div class="stat-value" id="stat-approved">0</div>
                        <div class="stat-desc" style="color:#64748b;">Rekod prestasi semasa</div>
                    </div>
                </div>

                <div class="table-section">
                    <div class="table-header">
                        <h3 style="margin:0;">📋 Aktiviti Penghantaran Terkini</h3>
                    </div>
                    <div style="overflow-x:auto;">
                        <table id="table-analisis">
                            <thead>
                                <tr>
                                    <th>Nama Guru</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Status</th>
                                    <th>Tarikh PdP</th>
                                </tr>
                            </thead>
                            <tbody id="tbodyAnalisis">
                                <tr><td colspan="4" style="text-align:center; padding:30px; color:#94a3b8;">Sedang memuatkan data...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div id="view-semakan-rph" style="display:none; animation: fadeIn 0.3s;"></div>
            <style>@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }</style>
        </div>
    `;

    // EVENT LISTENER: BUKA MODUL SEMAKAN BILA KAD DIKLIK
    const cardSemak = document.getElementById('card-trigger-semak');
    if(cardSemak) {
        cardSemak.onclick = () => {
            const dashboard = document.getElementById('view-dashboard-overview');
            const semakan = document.getElementById('view-semakan-rph');
            
            if(dashboard && semakan) {
                dashboard.style.display = 'none';
                semakan.style.display = 'block';

                // Panggil fungsi dari penyelia-semak.js
                if (typeof initSemakRPH === 'function') {
                    initSemakRPH();
                    loadSemakList();
                } else {
                    alert("Ralat: Gagal memuatkan modul semakan.");
                }
            }
        };
    }

    // TARIK DATA DARI GOOGLE APPS SCRIPT
    await fetchStatsAndAnalysis(user.email);
}

// ==========================================================================================
// 3. FUNGSI MENDAPATKAN STATISTIK & JADUAL
// ==========================================================================================
async function fetchStatsAndAnalysis(emailPenyelia) {
    try {
        const resp = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                action: 'getSenaraiRPH_Penyelia', 
                emailPenyelia: emailPenyelia 
            })
        });
        
        const res = await resp.json();
        const tbody = document.getElementById('tbodyAnalisis');

        if (!res.success || !res.data || res.data.length === 0) {
            document.getElementById('stat-pending').innerText = "0";
            document.getElementById('stat-approved').innerText = "0";
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px;">Tiada aktiviti RPH ditemui.</td></tr>';
            return;
        }

        let pendingCount = 0;
        let approvedCount = 0;

        res.data.forEach(rph => {
            if (rph.status.toLowerCase() === 'dihantar') pendingCount++;
            if (rph.status.toLowerCase() === 'disahkan') approvedCount++;
        });

        document.getElementById('stat-pending').innerText = pendingCount;
        document.getElementById('stat-approved').innerText = approvedCount;

        // Papar 10 terkini sahaja di dashboard
        const recentList = res.data.slice(0, 10);
        let html = '';

        recentList.forEach(data => {
            const emelGuru = (data.emelGuru || "").toLowerCase();
            const namaGuru = window.teacherMap[emelGuru] || data.emelGuru || "Tidak Diketahui";
            
            let badgeClass = 'bg-draf';
            if(data.status.toLowerCase() === 'disahkan') badgeClass = 'bg-success';
            if(data.status.toLowerCase() === 'dihantar') badgeClass = 'bg-pending';

            html += `
                <tr style="transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                    <td style="font-weight:600; color:#1e293b;">${namaGuru.toUpperCase()}</td>
                    <td>${data.subjek || 'Tiada Subjek'}</td>
                    <td><span class="status-badge ${badgeClass}">${data.status.toUpperCase()}</span></td>
                    <td style="color:#64748b;">${data.tarikh || '-'}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;

    } catch (e) {
        console.error("Ralat Fetch Data:", e);
        const errEl = document.getElementById('tbodyAnalisis');
        if(errEl) errEl.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center; padding:20px;">Gagal memuatkan data dari pangkalan data.</td></tr>';
    }
}