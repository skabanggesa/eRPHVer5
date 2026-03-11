// assets/js/guru/guru-jana.js
import { API_URL } from '../config.js';

// Jadikan hantarKeDatabase global supaya onclick dalam HTML boleh memanggilnya
window.hantarKeDatabase = hantarKeDatabase;

export async function initJanaRPH() {
    const container = document.getElementById('guru-module-container');
    const user = JSON.parse(localStorage.getItem('eRPH_User'));

    // 1. Bina Antaramuka Jana RPH (dengan butang kembali & Jana Pukal)
    container.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0;">⚡ Jana RPH Automatik</h3>
                <button id="btnKembaliJana" style="background:#64748b; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;">🔙 Kembali</button>
            </div>
            <p style="color:#64748b; margin-top:5px;">Pilih julat tarikh untuk menyemak jadual dan menjana draf RPH daripada bank data JSON.</p>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                <div>
                    <label style="display:block; font-size:12px;">Tarikh Mula:</label>
                    <input type="date" id="dateStart" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div>
                    <label style="display:block; font-size:12px;">Tarikh Tamat:</label>
                    <input type="date" id="dateEnd" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <button id="btnSemakJadual" style="align-self: flex-end; background: #3b82f6; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">🔍 Semak Jadual & Jana</button>
            </div>
            
            <div id="ruangJanaPukal" style="display:none; margin-bottom:15px; text-align:right;">
                <button id="btnJanaPukal" style="background:#8b5cf6; color:white; border:none; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.1);">🚀 Jana Semua RPH Serentak</button>
            </div>

            <div id="keputusanJadual" style="margin-top: 20px;"></div>
        </div>
    `;

    // 2. FUNGSI BUTANG KEMBALI
    document.getElementById('btnKembaliJana').addEventListener('click', () => {
        document.getElementById('guru-module-container').style.display = 'none';
        document.getElementById('guru-menu').style.display = 'grid';
    });

    // 3. FUNGSI SEMAK JADUAL & JANA
    document.getElementById('btnSemakJadual').addEventListener('click', async () => {
        const dStart = document.getElementById('dateStart').value;
        const dEnd = document.getElementById('dateEnd').value;
        const divKeputusan = document.getElementById('keputusanJadual');
        const ruangPukal = document.getElementById('ruangJanaPukal');

        if (!dStart || !dEnd) {
            alert("Sila pilih Tarikh Mula dan Tarikh Tamat!");
            return;
        }

        divKeputusan.innerHTML = "<p style='color:blue;'>⏳ Sedang memproses jadual dan menarik data JSON... Sila tunggu sebentar.</p>";
        ruangPukal.style.display = 'none'; // Sembunyikan pukal masa loading

        try {
            // Tarik jadual guru dari API
            const resp = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'getJadual', emailGuru: user.email })
            });
            const resData = await resp.json();

// Ambil data jadual (sistem akan semak sama ada ia dipanggil .data atau .jadual)
            const jadual = resData.data || resData.jadual || [];

            if (!resData.success || jadual.length === 0) {
                divKeputusan.innerHTML = "<p style='color:red;'>Tiada jadual ditemui. Sila isi jadual waktu di menu Jadual Waktu dahulu.</p>";
                return;
            }
            const cutiData = await dapatkanCutiUmum(new Date(dStart).getFullYear());

            let currentDate = new Date(dStart);
            const endDate = new Date(dEnd);
            let resultHTML = "";

            // Loop untuk setiap hari
            while (currentDate <= endDate) {
                const dayIndex = currentDate.getDay();
                const namaHari = getNamaHari(dayIndex);
                const strDate = formatDateStr(currentDate);

                // Abaikan Sabtu/Ahad
                if (dayIndex === 0 || dayIndex === 6) {
                    currentDate.setDate(currentDate.getDate() + 1);
                    continue;
                }

                const cutiIni = semakCuti(strDate, cutiData);
                if (cutiIni) {
                    resultHTML += `<div style="background:#fee2e2; padding:10px; margin-bottom:10px; border-radius:6px;"><strong>${strDate} (${namaHari})</strong> - Cuti: ${cutiIni.name}</div>`;
                } else {
                    const kelasHariIni = jadual.filter(j => j.hari === namaHari);
                    if (kelasHariIni.length > 0) {
                        resultHTML += `<h4 style="margin: 20px 0 10px 0; border-bottom: 2px solid #eee; padding-bottom: 5px;">${strDate} (${namaHari})</h4>`;
                        
                        for (let slot of kelasHariIni) {
                            const dataRPH = await cariDataRPH(slot.subjek, strDate);
                            if (dataRPH) {
                                resultHTML += buildRPHCard(slot, strDate, dataRPH);
                            } else {
                                resultHTML += buildErrorCard(slot, strDate, "Tiada data JSON ditemui untuk minggu ini.");
                            }
                        }
                    } else {
                        resultHTML += `<div style="background:#f3f4f6; padding:10px; margin-bottom:10px; border-radius:6px;"><strong>${strDate} (${namaHari})</strong> - Tiada kelas.</div>`;
                    }
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }

            divKeputusan.innerHTML = resultHTML;

            // Paparkan butang Jana Pukal jika ada RPH yang sedia dijana
            if (resultHTML.includes("btn-simpan-rph")) {
                ruangPukal.style.display = 'block';
            }

        } catch (error) {
            console.error("Ralat memproses jana RPH:", error);
            divKeputusan.innerHTML = "<p style='color:red;'>Berlaku ralat pelayan. Sila cuba lagi.</p>";
        }
    });

    // 4. FUNGSI JANA PUKAL
    document.getElementById('btnJanaPukal').addEventListener('click', async () => {
        const butangSemua = document.querySelectorAll('.btn-simpan-rph');
        const butangPukal = document.getElementById('btnJanaPukal');
        
        if (butangSemua.length === 0) return;
        
        butangPukal.innerText = "⏳ Sedang Menjana...";
        butangPukal.disabled = true;
        butangPukal.style.background = "#9ca3af";

        for (let i = 0; i < butangSemua.length; i++) {
            let btn = butangSemua[i];
            
            // Skip jika butang ini telah pun berjaya disimpan
            if (btn.innerText.includes("Berjaya")) continue; 
            
            btn.click(); // Tekan butang secara automatik
            
            // Tunggu 1.5 saat sebelum simpan RPH seterusnya untuk elak Google Sheets error
            await new Promise(resolve => setTimeout(resolve, 1500)); 
        }

        butangPukal.innerText = "✅ Semua Selesai Dijana!";
        butangPukal.style.background = "#10b981";
    });
}

// ---------------------------------------------------------
// FUNGSI-FUNGSI BANTUAN
// ---------------------------------------------------------

function getNamaHari(index) {
    const hari = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
    return hari[index];
}

function formatDateStr(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

async function dapatkanCutiUmum(tahun) {
    try {
        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${tahun}/MY`);
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        return [];
    }
}

function semakCuti(dateStr, cutiArr) {
    return cutiArr.find(c => c.date === dateStr);
}

// Fungsi tentukan minggu
function kiraMinggu(tarikhPilih) {
    const d = new Date(tarikhPilih);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d - yearStart) / 86400000;
    return Math.ceil((pastDaysOfYear + yearStart.getDay() + 1) / 7);
}

// Tarik data dari fail JSON
async function cariDataRPH(subjek, tarikh) {
    let s = subjek.toLowerCase();
    let url = "";

    if (s.includes("bahasa melayu")) { url = "./assets/data/BM/bm-6.json"; }
    else if (s.includes("bahasa inggeris")) { url = "./assets/data/BI/bi-6.json"; }
    else if (s.includes("matematik")) { url = "./assets/data/MT/mt-6.json"; }
    else if (s.includes("sains")) { url = "./assets/data/SN/sn-6.json"; }
    else if (s.includes("reka bentuk")) { url = "./assets/data/RBT/rbt-6.json"; }
    else if (s.includes("sejarah")) { url = "./assets/data/SJ/sj-6.json"; }
    else if (s.includes("pendidikan seni")) { url = "./assets/data/PSV/psv-6.json"; }
    else if (s.includes("pendidikan jasmani")) { url = "./assets/data/PJ/pj-6.json"; }
    else if (s.includes("pendidikan kesihatan")) { url = "./assets/data/PK/pk-6.json"; }
    
    if (!url) return null;

    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const listData = await res.json();
        
        let m = kiraMinggu(tarikh);
        let namaMinggu = "MINGGU " + m;
        let d = listData.find(item => item.minggu === namaMinggu);
        if (d) return d;
        
        return listData[0] || null;

    } catch (e) {
        console.log("Gagal load JSON:", url, e);
        return null;
    }
}

// BINA KAD RPH (DENGAN DATA LENGKAP JSON)
function buildRPHCard(slot, tarikh, data) {
    const rphDataToSave = {
        // TAMBAH TANDA ' DI DEPAN UNTUK PAKSA JADI TEKS DI GOOGLE SHEETS
        tarikh: "'" + tarikh, 
        hari: String(slot.hari),
        masaMula: "'" + slot.masaMula, 
        masaTamat: "'" + slot.masaTamat,
        masa: "'" + slot.masaMula + " - " + slot.masaTamat,
        
        kelas: slot.kelas,
        subjek: slot.subjek,
        tajuk: data.content.tajuk,
        objektif: data.content.objektif, 
        aktiviti: data.content.aktiviti,
        kemahiran: data.content.kemahiran || "",
        sk: data.content.sk || [],
        sp: data.content.sp || [],
        bbm: data.content.bbm || [],
        nilai: data.content.nilai || [],
        status: "Draf" 
    };

    const safeRPH = encodeURIComponent(JSON.stringify(rphDataToSave)).replace(/'/g, "%27");
    return `
        <div style="background: white; border-left: 5px solid #10b981; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong style="font-size:16px;">${slot.masaMula} - ${slot.masaTamat}</strong><br>
                <span style="font-size:14px; color:#64748b;">${slot.kelas} | ${slot.subjek}</span><br>
                <span style="color:#1e293b; font-weight:bold;">${data.content.tajuk}</span>
            </div>
            <div>
                <button class="btn-simpan-rph" onclick='hantarKeDatabase(JSON.parse(decodeURIComponent("${safeRPH}")), this)' style="background:#4f46e5; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;">Jana RPH Ini</button>
            </div>
        </div>
    `;
}

// =========================================================================
// FUNGSI HANTAR KE DATABASE (VERSI KEBAL RALAT 1899)
// =========================================================================
async function hantarKeDatabase(rphData, btnElement) {
    const user = JSON.parse(localStorage.getItem('eRPH_User'));
    
    // 1. PERISAI DATA: Tambah apostrof (') di depan Tarikh dan Masa
    // Ini memaksa Google Sheets menganggapnya sebagai TEXT bukannya DATE/TIME
    rphData.emelGuru = user.email;
    rphData.emelPenyelia = user.emelPenyelia || "";
    
    // Kita pastikan data dipaksa menjadi string dengan tanda ' di depan
    rphData.tarikh = "'" + String(rphData.tarikh).replace(/'/g, ""); 
    rphData.masaMula = "'" + String(rphData.masaMula).replace(/'/g, "");
    rphData.masaTamat = "'" + String(rphData.masaTamat).replace(/'/g, "");
    
    // Jika ada medan 'masa' gabungan, kita beri perisai juga
    if(rphData.masa) {
        rphData.masa = "'" + String(rphData.masa).replace(/'/g, "");
    }

    // 2. KEMASKINI UI BUTANG
    btnElement.innerText = "⏳ Menyimpan...";
    btnElement.disabled = true;
    btnElement.style.background = "#9ca3af";
    btnElement.style.cursor = "not-allowed";

    try {
        // 3. PENGHANTARAN DATA
        const resp = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'simpanRPH',
                dataRPH: rphData
            })
        });
        
        const resData = await resp.json();
        
        // 4. MAKLUM BALAS HASIL
        if (resData.success) {
            btnElement.innerText = "✅ Berjaya!";
            btnElement.style.background = "#10b981"; 
            btnElement.style.color = "white";
        } else {
            console.error("Ralat Server:", resData.message);
            alert("Gagal simpan: " + resData.message);
            btnElement.innerText = "Gagal. Cuba Lagi";
            btnElement.disabled = false;
            btnElement.style.background = "#ef4444";
        }
    } catch (e) {
        console.error("Ralat Network:", e);
        alert("Ralat Rangkaian: Sila pastikan sambungan internet stabil.");
        btnElement.innerText = "Ralat. Cuba Lagi";
        btnElement.disabled = false;
        btnElement.style.background = "#ef4444";
    }
}