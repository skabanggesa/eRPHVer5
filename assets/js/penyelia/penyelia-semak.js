/**
 * ==========================================================================================
 * MODUL SEMAKAN PENYELIA (VERSI LENGKAP DENGAN PUKAL, ULASAN AUTO & TANDATANGAN DIGITAL)
 * ==========================================================================================
 * Fail: assets/js/penyelia/penyelia-semak.js
 */

import { API_URL } from '../config.js';

let dataSemakanGlobal = [];

export function initSemakRPH() {
    const container = document.getElementById('view-semakan-rph');
    if (!container) return;

    container.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:2px solid #f1f5f9; padding-bottom:15px;">
                <h2 style="margin:0; color:#1e293b;">📋 Semakan RPH Guru</h2>
                <button id="btnKembaliDashboard" style="background:#64748b; color:white; border:none; padding:10px 18px; border-radius:8px; cursor:pointer; font-weight:bold;">🔙 Papan Pemuka</button>
            </div>
            
            <div style="margin-bottom:20px; display:flex; gap:10px;">
                <button class="filter-btn active" data-status="Dihantar" style="padding:10px 20px; border-radius:8px; border:2px solid #3b82f6; background:#eff6ff; color:#1d4ed8; font-weight:bold; cursor:pointer; transition:0.2s;">⏳ Menunggu Semakan</button>
                <button class="filter-btn" data-status="Disahkan" style="padding:10px 20px; border-radius:8px; border:2px solid #cbd5e1; background:#f8fafc; color:#64748b; font-weight:bold; cursor:pointer; transition:0.2s;">✅ Telah Disahkan</button>
            </div>

            <div id="barTindakanPukal" style="display:none; background:#ecfdf5; padding:15px 20px; border-radius:10px; border:1px solid #a7f3d0; margin-bottom:20px; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center;">
                    <input type="checkbox" id="chkPilihSemuaSemak" style="transform:scale(1.5); margin-right:15px; cursor:pointer;">
                    <label for="chkPilihSemuaSemak" style="font-weight:bold; color:#065f46; cursor:pointer;">Pilih Semua RPH Semasa</label>
                </div>
                <button onclick="window.bukaSemakanPukal()" style="background:#10b981; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:14px; box-shadow:0 2px 4px rgba(16,185,129,0.3);">✅ Sahkan Pukal Pilihan (<span id="jumlahPilihan">0</span>)</button>
            </div>

            <div id="status-semakan-loading" style="padding:30px; text-align:center; color:#64748b; font-weight:bold; font-size:16px;">⏳ Memuat turun data semakan...</div>
            <div id="senarai-semakan-container"></div>
        </div>

        <div id="modalSemakRPH" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:1000; justify-content:center; align-items:center; backdrop-filter:blur(4px);">
            <div style="background:white; padding:30px; border-radius:15px; width:95%; max-width:900px; max-height:90vh; overflow-y:auto; position:relative; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
                <div id="kandunganSemakRPH"></div>
                
                <div style="margin-top:25px; background:#f0f9ff; padding:20px; border-radius:10px; border:1px solid #bae6fd;">
                    <label style="font-weight:bold; color:#0369a1; display:block; margin-bottom:10px; font-size:15px;">💬 Ulasan / Catatan Penyelia:</label>
                    <textarea id="ulasanPenyelia" rows="3" style="width:100%; padding:12px; border-radius:8px; border:1px solid #93c5fd; font-family:inherit; font-size:14px;"></textarea>
                    
                    <div style="margin-top:15px; background:#fff; padding:10px; border-radius:6px; border:1px dashed #cbd5e1; display:flex; align-items:center; gap:10px;">
                        <span style="font-size:20px;">🖋️</span>
                        <div>
                            <div style="font-size:12px; color:#64748b; font-weight:bold;">TANDATANGAN DIGITAL</div>
                            <div id="paparanTandatanganInfo" style="font-size:13px; color:#1e293b;">Sistem akan merekodkan nama anda dan masa pengesahan secara automatik.</div>
                        </div>
                    </div>
                </div>

                <div style="margin-top:25px; border-top:2px solid #e2e8f0; padding-top:20px; display:flex; justify-content:space-between; align-items:center;">
                    <button id="btnTutupSemak" style="background:#64748b; color:white; border:none; padding:12px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">Batal / Tutup</button>
                    <div style="display:flex; gap:12px;" id="ruangButangTindakan"></div>
                </div>
            </div>
        </div>

        <div id="modalSemakPukal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:1001; justify-content:center; align-items:center; backdrop-filter:blur(4px);">
            <div style="background:white; padding:30px; border-radius:15px; width:90%; max-width:600px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
                <h3 style="margin-top:0; color:#065f46; border-bottom:2px solid #ecfdf5; padding-bottom:10px;">✅ Pengesahan Pukal</h3>
                <p style="color:#475569;">Anda sedang mengesahkan <strong id="jumlahPukalModal" style="color:#10b981; font-size:18px;">0</strong> RPH serentak.</p>
                
                <div style="margin-top:20px;">
                    <label style="font-weight:bold; color:#1e293b; display:block; margin-bottom:8px;">💬 Ulasan Seragam (Pilihan):</label>
                    <textarea id="ulasanPukal" rows="3" style="width:100%; padding:12px; border-radius:8px; border:1px solid #cbd5e1; font-family:inherit; font-size:14px;"></textarea>
                </div>

                <div style="margin-top:15px; background:#f8fafc; padding:12px; border-radius:6px; border:1px dashed #cbd5e1; font-size:12px; color:#64748b;">
                    <strong>ℹ️ Tandatangan Digital:</strong> Nama anda beserta tarikh dan masa semasa akan direkodkan pada semua RPH yang dipilih.
                </div>

                <div style="margin-top:25px; text-align:right;">
                    <button onclick="document.getElementById('modalSemakPukal').style.display='none'" style="background:#64748b; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold; margin-right:10px;">Batal</button>
                    <button onclick="window.prosesSahkanPukal()" style="background:#10b981; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">Sahkan Semua</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btnKembaliDashboard').onclick = () => {
        document.getElementById('view-semakan-rph').style.display = 'none';
        document.getElementById('view-dashboard-overview').style.display = 'block';
        if(typeof window.refreshDashboardPenyelia === 'function') window.refreshDashboardPenyelia();
    };

    document.getElementById('btnTutupSemak').onclick = () => {
        document.getElementById('modalSemakRPH').style.display = 'none';
    };

    // Logik Pilih Semua Checkbox
    document.getElementById('chkPilihSemuaSemak').onchange = (e) => {
        document.querySelectorAll('.chk-semakan-item').forEach(chk => {
            chk.checked = e.target.checked;
        });
        KiraJumlahPilihan();
    };

    // Logik Butang Penapis Status (Tab)
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.onclick = (e) => {
            filterBtns.forEach(b => {
                b.style.background = '#f8fafc';
                b.style.color = '#64748b';
                b.style.borderColor = '#cbd5e1';
                b.classList.remove('active');
            });
            e.target.style.background = '#eff6ff';
            e.target.style.color = '#1d4ed8';
            e.target.style.borderColor = '#3b82f6';
            e.target.classList.add('active');
            
            paparkanSenaraiIkutStatus(e.target.dataset.status);
        };
    });
}

export async function loadSemakList() {
    const userStr = localStorage.getItem('eRPH_User');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    document.getElementById('status-semakan-loading').style.display = 'block';
    document.getElementById('senarai-semakan-container').innerHTML = '';
    document.getElementById('barTindakanPukal').style.display = 'none';

    try {
        const resp = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getSenaraiRPH_Penyelia', emailPenyelia: user.email })
        });
        const res = await resp.json();
        
        if (res.success) {
            dataSemakanGlobal = res.data;
            paparkanSenaraiIkutStatus('Dihantar');
        } else {
            document.getElementById('senarai-semakan-container').innerHTML = '<p style="text-align:center;">Tiada data ditemui.</p>';
        }
    } catch (e) {
        document.getElementById('senarai-semakan-container').innerHTML = '<p style="text-align:center; color:red;">Ralat memuatkan data pelayan.</p>';
    } finally {
        document.getElementById('status-semakan-loading').style.display = 'none';
    }
}

function paparkanSenaraiIkutStatus(status) {
    const container = document.getElementById('senarai-semakan-container');
    const barPukal = document.getElementById('barTindakanPukal');
    container.innerHTML = '';
    
    // Reset Checkbox Pilih Semua
    const chkSemua = document.getElementById('chkPilihSemuaSemak');
    if(chkSemua) chkSemua.checked = false;

    const isDihantar = status.toLowerCase() === 'dihantar';
    barPukal.style.display = isDihantar ? 'flex' : 'none'; // Tunjuk bar pukal hanya untuk draf menunggu semakan

    const senaraiTapis = dataSemakanGlobal.filter(r => r.status.toLowerCase() === status.toLowerCase());

    if (senaraiTapis.length === 0) {
        barPukal.style.display = 'none';
        container.innerHTML = `<div style="text-align:center; padding:40px; background:#f8fafc; border-radius:10px; color:#64748b;">✅ Tiada RPH berstatus <strong>${status}</strong> pada masa ini.</div>`;
        return;
    }

    senaraiTapis.forEach(rph => {
        const card = document.createElement('div');
        
        // Cari nama guru dari map
        const emelGuru = (rph.emelGuru || "").toLowerCase();
        const namaGuru = window.teacherMap && window.teacherMap[emelGuru] ? window.teacherMap[emelGuru] : emelGuru;

        card.style = `border:1px solid #e2e8f0; padding:18px; border-radius:12px; margin-bottom:15px; background:${isDihantar?'#fff':'#f0fdf4'}; display:flex; align-items:center; border-left:6px solid ${isDihantar?'#f59e0b':'#10b981'}; transition:transform 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.05);`;
        
        card.innerHTML = `
            ${isDihantar ? `<div style="margin-right:15px;"><input type="checkbox" class="chk-semakan-item" value="${rph.idRPH}" style="transform:scale(1.4); cursor:pointer;"></div>` : ''}
            <div style="flex-grow:1;">
                <div style="font-weight:bold; color:#0f172a; font-size:16px;">👨‍🏫 ${namaGuru.toUpperCase()}</div>
                <div style="color:#475569; font-size:13px; margin-top:5px; font-weight:500;">📅 ${rph.tarikh} | ⏰ ${rph.masa} | 🏫 ${rph.kelas}</div>
                <div style="font-size:13px; color:#64748b; margin-top:3px;">📚 Subjek: <strong>${rph.subjek}</strong> | Tajuk: ${rph.tajuk}</div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                <span style="font-size:11px; padding:5px 12px; border-radius:20px; font-weight:bold; background:${isDihantar?'#fff7ed':'#dcfce3'}; color:${isDihantar?'#c2410c':'#166534'};">${rph.status.toUpperCase()}</span>
                <button onclick="window.bukaSemakan('${rph.idRPH}')" style="background:#3b82f6; color:white; border:none; padding:8px 20px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:13px; box-shadow:0 2px 4px rgba(59,130,246,0.3);">Papar & Semak</button>
            </div>
        `;
        container.appendChild(card);
    });

    // Tambah event listener kepada semua checkbox baru
    document.querySelectorAll('.chk-semakan-item').forEach(chk => {
        chk.onchange = KiraJumlahPilihan;
    });
    
    KiraJumlahPilihan(); // Init count
}

function KiraJumlahPilihan() {
    const jumlah = document.querySelectorAll('.chk-semakan-item:checked').length;
    document.getElementById('jumlahPilihan').innerText = jumlah;
    document.getElementById('jumlahPukalModal').innerText = jumlah;
}

// BUKA PAPARAN MODAL INDIVIDU
window.bukaSemakan = (id) => {
    const rph = dataSemakanGlobal.find(item => item.idRPH === id);
    if(!rph) return alert("Ralat: Data RPH tidak dijumpai.");

    const container = document.getElementById('kandunganSemakRPH');
    const emelGuru = (rph.emelGuru || "").toLowerCase();
    const namaGuruPenuh = window.teacherMap && window.teacherMap[emelGuru] ? window.teacherMap[emelGuru] : emelGuru;

    container.innerHTML = `
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px;">
            <h2 style="margin:0; color:#1e293b;">Rancangan Pengajaran Harian</h2>
            <div style="color:#64748b; font-size:14px; margin-top:5px;">Nama Guru: <strong style="color:#0f172a;">${namaGuruPenuh.toUpperCase()}</strong></div>
        </div>
        <table style="width:100%; font-size:14px; border-collapse:collapse; margin-bottom:20px;">
            <tr><td style="padding:10px; border:1px solid #e2e8f0; background:#f8fafc;" width="20%"><strong>Subjek</strong></td><td style="padding:10px; border:1px solid #e2e8f0;">${rph.subjek}</td><td style="padding:10px; border:1px solid #e2e8f0; background:#f8fafc;" width="20%"><strong>Hari</strong></td><td style="padding:10px; border:1px solid #e2e8f0;">${rph.hari}</td></tr>
            <tr><td style="padding:10px; border:1px solid #e2e8f0; background:#f8fafc;"><strong>Tarikh</strong></td><td style="padding:10px; border:1px solid #e2e8f0;">${rph.tarikh}</td><td style="padding:10px; border:1px solid #e2e8f0; background:#f8fafc;"><strong>Masa/Kelas</strong></td><td style="padding:10px; border:1px solid #e2e8f0;">${rph.masa} / ${rph.kelas}</td></tr>
        </table>
        <div style="background:#f1f5f9; padding:12px; border-radius:6px; margin-bottom:15px; border-left:4px solid #3b82f6;"><strong>Tajuk:</strong> ${rph.tajuk}</div>
        <table style="width:100%; font-size:14px; line-height:1.6;">
            <tr><td width="25%" valign="top"><strong>SK</strong></td><td valign="top">: <div style="margin-top:-20px; margin-left:10px;">${formatSenarai(rph.sk)}</div></td></tr>
            <tr><td width="25%" valign="top"><strong>SP</strong></td><td valign="top">: <div style="margin-top:-20px; margin-left:10px;">${formatSenarai(rph.sp)}</div></td></tr>
        </table>
        <div style="background:#fffbeb; border-left:4px solid #f59e0b; padding:15px; border-radius:0 6px 6px 0; margin:15px 0;">
            <strong style="color:#92400e;">🎯 Objektif:</strong><div style="margin-top:8px;">${formatSenarai(rph.objektif)}</div>
        </div>
        <div style="background:#f8fafc; border-left:4px solid #64748b; padding:15px; border-radius:0 6px 6px 0; margin-bottom:15px;">
            <strong style="color:#1e293b;">📝 Aktiviti:</strong><div style="margin-top:8px;">${formatAktiviti(rph.aktiviti)}</div>
        </div>
        <div style="background:#ecfdf5; border:1px solid #a7f3d0; padding:15px; border-radius:8px;">
            <strong style="color:#065f46;">📊 Refleksi:</strong><div style="margin-top:8px; font-style:italic; font-weight:bold; color:#047857;">${rph.refleksi || '<span style="color:#ef4444;">Belum diisi.</span>'}</div>
        </div>
    `;

    // AUTOMASI ULASAN
    const ulasanAuto = "PdP dirancang dengan baik dan objektif bersesuaian dengan tahap murid. Teruskan kecemerlangan.";
    document.getElementById('ulasanPenyelia').value = rph.ulasanPenyelia || ulasanAuto;

    // KEMASKINI INFO TANDATANGAN DIGITAL
    const userStr = localStorage.getItem('eRPH_User');
    const user = userStr ? JSON.parse(userStr) : { nama: "Penyelia" };
    document.getElementById('paparanTandatanganInfo').innerHTML = `Akan disahkan oleh: <strong>${user.nama}</strong>`;

    const ruangButang = document.getElementById('ruangButangTindakan');
    if (rph.status === 'Dihantar') {
        ruangButang.innerHTML = `
            <button onclick="window.hantarSemakanToServer(['${rph.idRPH}'], 'Draf')" style="background:#ef4444; color:white; border:none; padding:12px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">↩️ Kembalikan (Draf)</button>
            <button onclick="window.hantarSemakanToServer(['${rph.idRPH}'], 'Disahkan')" style="background:#10b981; color:white; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:15px;">✅ Sahkan RPH</button>
        `;
    } else {
        ruangButang.innerHTML = `<button onclick="window.hantarSemakanToServer(['${rph.idRPH}'], 'Draf')" style="background:#f59e0b; color:white; border:none; padding:12px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">⚠️ Batal Pengesahan</button>`;
    }

    document.getElementById('modalSemakRPH').style.display = 'flex';
};

// BUKA MODAL PUKAL
window.bukaSemakanPukal = () => {
    const jumlah = document.querySelectorAll('.chk-semakan-item:checked').length;
    if(jumlah === 0) {
        alert("Sila pilih (tick) sekurang-kurangnya satu RPH untuk disahkan secara pukal.");
        return;
    }
    const ulasanAuto = "PdP dirancang dengan baik dan objektif bersesuaian dengan tahap murid. Teruskan kecemerlangan.";
    document.getElementById('ulasanPukal').value = ulasanAuto;
    document.getElementById('modalSemakPukal').style.display = 'flex';
};

// PROSES SAHKAN PUKAL
window.prosesSahkanPukal = () => {
    const checkboxes = document.querySelectorAll('.chk-semakan-item:checked');
    const ids = Array.from(checkboxes).map(chk => chk.value);
    
    document.getElementById('modalSemakPukal').style.display = 'none';
    window.hantarSemakanToServer(ids, 'Disahkan', document.getElementById('ulasanPukal').value);
};

// FUNGSI PENGHANTARAN KE SERVER (MENYOKONG INDIVIDU & PUKAL)
window.hantarSemakanToServer = async (idList, statusBaru, ulasanPukal = null) => {
    // Tentukan ulasan mana yang nak dihantar
    const ulasan = ulasanPukal !== null ? ulasanPukal : document.getElementById('ulasanPenyelia').value;
    
    // JANA TANDATANGAN DIGITAL
    const user = JSON.parse(localStorage.getItem('eRPH_User'));
    const namaPenyelia = user ? user.nama : "Penyelia";
    const tarikhMasa = new Date().toLocaleString('ms-MY');
    const tandatanganDigital = statusBaru === 'Disahkan' 
        ? `Ditandatangani secara digital oleh ${namaPenyelia} pada ${tarikhMasa}` 
        : ""; // Jika kembalikan/batal, kosongkan tandatangan

    // Bentuk tatasusunan (array) payload untuk dihantar ke Code.gs
    const payloadSemakan = idList.map(id => ({
        idRPH: id,
        statusBaru: statusBaru,
        ulasan: ulasan,
        tandatangan: tandatanganDigital
    }));

    let mesej = statusBaru === 'Disahkan' 
        ? `Mengesahkan ${idList.length} RPH dengan tandatangan digital anda. Teruskan?` 
        : `Mengembalikan ${idList.length} RPH kepada guru. Teruskan?`;

    if(!confirm(mesej)) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                action: 'sahkanRPH', 
                dataSemakan: payloadSemakan // Hantar dalam bentuk array, memudahkah server proses Pukal / Single
            })
        });

        const result = await response.json();
        
        if (result.success) {
            alert(`Berjaya! ${idList.length} RPH telah ${statusBaru}.`);
            document.getElementById('modalSemakRPH').style.display = 'none';
            loadSemakList(); // Refresh senarai automatik
        } else {
            alert("Ralat: " + result.message);
        }
    } catch (error) {
        alert("Ralat sambungan ke pelayan pangkalan data.");
    }
};

// FUNGSI BANTUAN UI
function formatSenarai(data) {
    if (!data) return '-';
    if (Array.isArray(data)) return `<ul style="margin:0; padding-left:18px;">${data.map(item => `<li>${item}</li>`).join('')}</ul>`;
    return data.replace(/\n/g, '<br>');
}
function formatAktiviti(data) {
    if (!data) return '-';
    if (Array.isArray(data)) return `<ul style="margin:0; padding-left:18px;">${data.map(item => typeof item === 'object' ? `<li><strong>${item.fase}:</strong> ${item.text}</li>` : `<li>${item}</li>`).join('')}</ul>`;
    return data;
}
