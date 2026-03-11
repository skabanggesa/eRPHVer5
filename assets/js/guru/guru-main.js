// assets/js/guru/guru-main.js
// VERSI GOOGLE SHEETS

import { logKeluar } from '../auth.js';

// Nanti kita akan import fungsi init dari jadual dan jana rph
import { initJadualModule } from './guru-jadual.js';
import { initJanaRPH } from './guru-jana.js'; 
import { initSejarahModule } from './guru-sejarah.js';


export async function initGuruDashboard() {
    const targetDiv = document.getElementById('main-content');
    
    // Dapatkan data Guru dari localStorage
    const userStr = localStorage.getItem('eRPH_User');
    if (!userStr) {
        logKeluar();
        return;
    }
    const guruData = JSON.parse(userStr);

    // BINA UI DASHBOARD UTAMA GURU
    targetDiv.innerHTML = `
<style>
            /* Latar belakang utama (Body) - Jika boleh, tambah ini dalam fail Index.html nanti */
            body { background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; }

            /* Header Papan Pemuka */
            .dashboard-header { 
                background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%); 
                padding: 2.5rem 2rem; 
                border-radius: 16px; 
                box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); 
                margin-bottom: 25px; 
                text-align: center; 
                position: relative;
                border: 1px solid #e2e8f0;
            }
            
            /* Butang Log Keluar */
            .btn-logout { 
                position: absolute; 
                top: 20px; 
                right: 20px; 
                background: linear-gradient(to right, #ef4444, #dc2626); 
                color: white; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 8px; 
                cursor: pointer; 
                font-weight: 600;
                box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
                transition: all 0.3s ease;
            }
            .btn-logout:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 8px -1px rgba(239, 68, 68, 0.5);
            }

            /* Susun Atur Menu */
            .menu-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); 
                gap: 24px; 
            }
            
            /* Kad Butang Menu */
            .menu-btn { 
                background: white; 
                padding: 35px 20px; 
                border-radius: 16px; 
                border: 1px solid #e2e8f0; 
                cursor: pointer; 
                text-align: center; 
                transition: all 0.3s ease; 
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); 
                display: flex; 
                flex-direction: column; 
                align-items: center;
            }
            .menu-btn:hover { 
                border-color: #6366f1; 
                transform: translateY(-8px); 
                box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.15);
            }
            
            /* Ikon & Teks dalam Kad */
            .menu-icon { 
                font-size: 3.5rem; 
                margin-bottom: 20px; 
                transition: transform 0.3s ease;
            }
            .menu-btn:hover .menu-icon {
                transform: scale(1.1);
            }
            .menu-title { 
                font-size: 1.25rem; 
                font-weight: 700; 
                color: #1e293b; 
                margin-bottom: 12px;
            }
            .menu-desc { 
                font-size: 0.95rem; 
                color: #64748b; 
                line-height: 1.5;
            }
            
            /* Container Modul Utama */
            #guru-module-container { 
                margin-top: 30px; 
                display: none; 
                background: white; 
                padding: 25px; 
                border-radius: 16px; 
                box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); 
                border: 1px solid #e2e8f0;
            }
        </style>

        <div class="dashboard-header" id="guru-header">
            <button class="btn-logout" id="btnLogoutGuru">Log Keluar</button>
            <h1 style="margin:0; color:#1e293b;">eRPH Guru</h1>
            <p style="color:#64748b; margin-top:5px;">Selamat datang, ${guruData.nama}</p>
            ${guruData.emelPenyelia ? `<p style="font-size:0.85rem; color:#10b981; margin:0;">Penyelia Anda: ${guruData.namaPenyelia || guruData.emelPenyelia}</p>` : `<p style="font-size:0.85rem; color:#ef4444; margin:0;">Sila maklumkan Admin untuk menetapkan Penyelia anda.</p>`}
        </div>

        <div class="menu-grid" id="guru-menu">
            <div class="menu-btn" id="btnJadual">
                <div class="menu-icon">📅</div>
                <div class="menu-title">Jadual Waktu</div>
                <div class="menu-desc">Urus jadual kelas mingguan anda.</div>
            </div>
            <div class="menu-btn" id="btnJana">
                <div class="menu-icon">⚡</div>
                <div class="menu-title">Jana RPH</div>
                <div class="menu-desc">Jana draf RPH harian berdasarkan jadual.</div>
            </div>
            <div class="menu-btn" id="btnSejarah">
                <div class="menu-icon">📂</div>
                <div class="menu-title">Sejarah & Penghantaran</div>
                <div class="menu-desc">Edit refleksi dan hantar RPH kepada penyelia.</div>
            </div>
        </div>

        <div id="guru-module-container">
            </div>
    `;

// 2. DAFTAR EVENT LISTENERS (Mesti selepas innerHTML)
    document.getElementById('btnLogoutGuru').addEventListener('click', logKeluar);

    document.getElementById('btnJadual').addEventListener('click', () => {
        document.getElementById('guru-menu').style.display = 'none';
        document.getElementById('guru-module-container').style.display = 'block';
        initJadualModule(guruData);
    });

    document.getElementById('btnJana').addEventListener('click', () => {
        document.getElementById('guru-menu').style.display = 'none';
        document.getElementById('guru-module-container').style.display = 'block';
        initJanaRPH(); // Fungsi dari guru-jana.js
    });

    document.getElementById('btnSejarah').addEventListener('click', () => {
        document.getElementById('guru-menu').style.display = 'none';
        document.getElementById('guru-module-container').style.display = 'block';
        initSejarahModule(); // Fungsi dari guru-sejarah.js
    });
}

// =========================================================================
// BUTANG KEMBALI KE MOD PENYELIA (Khas untuk Penyelia yang menyamar)
// =========================================================================

window.kembaliKePenyelia = function() {
    let userStr = localStorage.getItem('eRPH_User');
    if(userStr) {
        let user = JSON.parse(userStr);
        user.role = 'penyelia'; 
        localStorage.setItem('eRPH_User', JSON.stringify(user));
    }
    localStorage.setItem('userRole', 'penyelia');
    localStorage.removeItem('asalPenyelia'); // Padam jejak rahsia
    window.location.reload(); // Kembali ke paparan Penyelia!
};

// Pasang butang terapung jika ada jejak 'asalPenyelia'
if (localStorage.getItem('asalPenyelia') === 'ya') {
    // Tunggu sekejap supaya UI Guru siap dimuatkan
    setTimeout(() => {
        const btnKembali = document.createElement('button');
        btnKembali.innerHTML = '🔙 Kembali ke Mod Penyelia';
        btnKembali.style.position = 'fixed';
        btnKembali.style.bottom = '20px';
        btnKembali.style.right = '20px';
        btnKembali.style.zIndex = '9999';
        btnKembali.style.padding = '12px 20px';
        btnKembali.style.backgroundColor = '#dc2626'; // Warna Merah
        btnKembali.style.color = 'white';
        btnKembali.style.border = 'none';
        btnKembali.style.borderRadius = '8px';
        btnKembali.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
        btnKembali.style.cursor = 'pointer';
        btnKembali.style.fontWeight = 'bold';
        btnKembali.onclick = window.kembaliKePenyelia;
        
        // Masukkan butang ke dalam body web
        document.body.appendChild(btnKembali);
    }, 500);
}