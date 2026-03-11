// assets/js/guru/guru-jadual.js
// VERSI GOOGLE SHEETS

import { API_URL } from '../config.js'; // Pastikan anda ada export API_URL dalam config.js

export async function initJadualModule(guruData) {
    const container = document.getElementById('guru-module-container');
    
    // 1. Bina Rangka UI untuk Jadual
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="margin:0; color:#1e293b;">Jadual Waktu Mengajar</h2>
            <button id="btnTutupJadual" style="background:#64748b; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;">Tutup</button>
        </div>
        
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
            <div style="background:#f8fafc; padding:20px; border-radius:10px; border:1px solid #e2e8f0;">
                <h3 style="margin-top:0;">Tambah Kelas Baru</h3>
                <form id="formJadual">
                    <div style="margin-bottom:10px;">
                        <label style="display:block; font-size:0.9rem; margin-bottom:5px;">Hari</label>
                        <select id="jHari" required style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px;">
                            <option value="Isnin">Isnin</option>
                            <option value="Selasa">Selasa</option>
                            <option value="Rabu">Rabu</option>
                            <option value="Khamis">Khamis</option>
                            <option value="Jumaat">Jumaat</option>
                        </select>
                    </div>
                    <div style="display:flex; gap:10px; margin-bottom:10px;">
                        <div style="flex:1;">
                            <label style="display:block; font-size:0.9rem; margin-bottom:5px;">Mula</label>
                            <input type="time" id="jMula" required style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;">
                        </div>
                        <div style="flex:1;">
                            <label style="display:block; font-size:0.9rem; margin-bottom:5px;">Tamat</label>
                            <input type="time" id="jTamat" required style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;">
                        </div>
                    </div>
                    <div style="margin-bottom:10px;">
                        <label style="display:block; font-size:0.9rem; margin-bottom:5px;">Subjek</label>
                        <input type="text" id="jSubjek" required placeholder="Contoh: Bahasa Melayu" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;">
                    </div>
                    <div style="margin-bottom:15px;">
                        <label style="display:block; font-size:0.9rem; margin-bottom:5px;">Kelas</label>
                        <input type="text" id="jKelas" required placeholder="Contoh: 1 Arif" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;">
                    </div>
                    <button type="submit" style="width:100%; background:#4f46e5; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer;">Tambah ke Jadual</button>
                </form>
            </div>

            <div>
                <div id="jadualLoading" style="text-align:center; padding:20px; color:#64748b;">Memuatkan jadual...</div>
                <div id="senaraiJadualContainer" style="display:none; display:flex; flex-direction:column; gap:10px;">
                    </div>
                <button id="btnSimpanJadual" style="display:none; margin-top:15px; width:100%; background:#10b981; color:white; border:none; padding:12px; border-radius:6px; font-weight:bold; cursor:pointer;">Simpan Jadual ke Database</button>
            </div>
        </div>
    `;

    // 2. Daftar Event Listeners asas
    document.getElementById('btnTutupJadual').addEventListener('click', () => {
        document.getElementById('guru-module-container').style.display = 'none';
        document.getElementById('guru-menu').style.display = 'grid';
    });

    let jadualSemasa = [];

// 3. Muat turun Jadual dari Google Sheets
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getJadual', emailGuru: guruData.email })
        });
        const result = await response.json();
        
        // Semak untuk tujuan Debugging
        console.log("Data Jadual dari Server:", result);
        
        if (result.success) {
            jadualSemasa = result.jadual || [];
            renderSenaraiJadual(jadualSemasa);
        } else {
            // JIKA SERVER PULANGKAN RALAT (success: false)
            document.getElementById('jadualLoading').innerHTML = `<span style="color:red;">❌ Ralat Server: ${result.message}</span>`;
            document.getElementById('btnSimpanJadual').style.display = 'block'; // Benarkan pengguna simpan jadual baru
        }
    } catch (e) {
        document.getElementById('jadualLoading').innerHTML = `<span style="color:red;">❌ Ralat Pelayan/Internet.</span>`;
    }

    // 4. Logik Tambah Kelas (Secara Lokal / UI Sahaja Dulu)
    document.getElementById('formJadual').addEventListener('submit', (e) => {
        e.preventDefault();
        const kelasBaru = {
            hari: document.getElementById('jHari').value,
            masaMula: document.getElementById('jMula').value,
            masaTamat: document.getElementById('jTamat').value,
            subjek: document.getElementById('jSubjek').value,
            kelas: document.getElementById('jKelas').value
        };
        jadualSemasa.push(kelasBaru);
        renderSenaraiJadual(jadualSemasa);
        e.target.reset(); // Kosongkan borang
    });

    // 5. Logik Simpan ke Google Sheets
    document.getElementById('btnSimpanJadual').addEventListener('click', async (e) => {
        const btn = e.target;
        btn.innerText = "Menyimpan...";
        btn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ 
                    action: 'simpanJadual', 
                    emailGuru: guruData.email,
                    jadualData: jadualSemasa
                })
            });
            const result = await response.json();
            if (result.success) {
                alert("Jadual berjaya disimpan!");
            } else {
                alert("Gagal: " + result.message);
            }
        } catch (err) {
            alert("Ralat berhubung dengan pelayan.");
        } finally {
            btn.innerText = "Simpan Jadual ke Database";
            btn.disabled = false;
        }
    });

    // Sub-fungsi untuk memaparkan senarai jadual secara dinamik (terdedah ke window untuk butang Padam)
    window.padamKelas = (index) => {
        jadualSemasa.splice(index, 1); // Buang dari array
        renderSenaraiJadual(jadualSemasa); // Render semula
    };

    function renderSenaraiJadual(data) {
        document.getElementById('jadualLoading').style.display = 'none';
        const container = document.getElementById('senaraiJadualContainer');
        container.style.display = 'flex';
        document.getElementById('btnSimpanJadual').style.display = 'block';

        if (data.length === 0) {
            container.innerHTML = `<div style="padding:20px; text-align:center; background:white; border-radius:8px;">Belum ada jadual. Sila tambah di sebelah.</div>`;
            return;
        }

        // Susun ikut hari secara ringkas
        const susunanHari = { 'Isnin':1, 'Selasa':2, 'Rabu':3, 'Khamis':4, 'Jumaat':5 };
        data.sort((a,b) => (susunanHari[a.hari] || 99) - (susunanHari[b.hari] || 99));

        let html = '';
        data.forEach((item, index) => {
            html += `
                <div style="background:white; padding:15px; border-radius:8px; border-left:4px solid #4f46e5; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    <div>
                        <div style="font-weight:bold; color:#1e293b;">${item.subjek} - ${item.kelas}</div>
                        <div style="font-size:0.85rem; color:#64748b; margin-top:4px;">📅 ${item.hari} &nbsp;|&nbsp; ⏰ ${item.masaMula} hingga ${item.masaTamat}</div>
                    </div>
                    <button onclick="window.padamKelas(${index})" style="background:#fee2e2; color:#dc2626; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Padam</button>
                </div>
            `;
        });
        container.innerHTML = html;
    }
}