// assets/js/guru/guru-sejarah.js
import { API_URL } from '../config.js';

let dataRPHGlobal = []; // Menyimpan data asal supaya boleh ditapis berulang kali

export async function initSejarahModule() {
    const container = document.getElementById('guru-module-container');
    const user = JSON.parse(localStorage.getItem('eRPH_User'));

    // 1. Bina Antaramuka Asas & Modal (Pop-up)
    container.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <h3 style="margin:0;">📚 Senarai RPH Saya</h3>
                <div style="display:flex; gap:8px; align-items:center;">
                    <button id="btnHantarPukal" style="display:none; background:#0ea5e9; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">✈️ Hantar Pukal</button>
                    <button id="btnCetakPukal" style="display:none; background:#475569; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">🖨️ Cetak Pukal</button>
                    <button id="btnHantarGC" style="display:none; background:#10b981; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">🏫 Hantar GC</button>
                    <button id="btnKemaskiniPukal" style="display:none; background:#8b5cf6; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">📝 Kemaskini Pukal</button>
                    <button id="btnJanaAIPukal" style="display:none; background: linear-gradient(135deg, #a855f7, #ec4899); color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">✨ Jana AI Pukal</button>
                    <button id="btnKembaliSejarah" style="background:#64748b; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;">🔙 Kembali</button>
                </div>
            </div>

            <div style="background:#f1f5f9; padding:15px; border-radius:8px; margin-top:15px; margin-bottom:15px; border:1px solid #cbd5e1; display:flex; flex-wrap:wrap; gap:15px; align-items:flex-end;">
                <div>
                    <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px; color:#475569;">DARI TARIKH:</label>
                    <input type="date" id="tarikhMulaTapis" style="padding:8px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
                </div>
                <div>
                    <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px; color:#475569;">HINGGA TARIKH:</label>
                    <input type="date" id="tarikhAkhirTapis" style="padding:8px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
                </div>
                <div style="display:flex; gap:8px;">
                    <button id="btnTapisSenarai" style="background:#3b82f6; color:white; border:none; padding:9px 18px; border-radius:6px; cursor:pointer; font-weight:bold; transition:0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">🔍 Cari</button>
                    <button id="btnResetTapis" style="background:#ef4444; color:white; border:none; padding:9px 18px; border-radius:6px; cursor:pointer; font-weight:bold; transition:0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">Reset</button>
                </div>
            </div>

            <div style="margin-bottom:12px; display:none; align-items:center; background:#ecfdf5; padding:12px 15px; border-radius:8px; border:1px solid #a7f3d0;" id="ruangPilihSemua">
                <input type="checkbox" id="chkPilihSemua" style="transform:scale(1.4); margin-right:15px; cursor:pointer;">
                <label for="chkPilihSemua" style="font-weight:bold; color:#065f46; cursor:pointer; font-size:14px;">Pilih Semua</label>
            </div>

            <div id="senarai-status" style="color:#4f46e5; font-weight:bold; padding:20px; text-align:center;">⏳ Memuat turun rekod dari pangkalan data...</div>
            <div id="senarai-container" style="margin-top: 15px;"></div>
        </div>
        
        <div id="modalAIPukalProgress" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; flex-direction:column; text-align:center;">
            <div style="font-size:60px; margin-bottom:15px; animation: pulse 1.5s infinite;">🤖</div>
            <h2 id="teksStatusAIPukal" style="color:white; margin:0; font-size:24px;">Memulakan Enjin AI...</h2>
            <p style="color:#94a3b8; max-width:400px; margin-top:10px;">Sila jangan tutup tetingkap ini. Sistem sedang memproses satu demi satu dan berehat 4 saat untuk mematuhi had pelayan Google.</p>
        </div>

        <div id="modalRPH" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:999; justify-content:center; align-items:center; backdrop-filter:blur(4px);">
            <div style="background:white; padding:25px; border-radius:12px; width:90%; max-width:850px; max-height:85vh; overflow-y:auto; position:relative; box-shadow:0 20px 25px -5px rgba(0,0,0,0.2);">
                <div id="kandunganPenuhRPH"></div>
                <div style="margin-top:20px; text-align:right; border-top:1px solid #e2e8f0; padding-top:20px; display:flex; justify-content:flex-end; gap:10px;">
                    <button id="btnCetakIndividu" style="background:#475569; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">🖨️ Cetak RPH Ini</button>
                    <button id="closeModal" style="background:#ef4444; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">Tutup</button>
                </div>
            </div>
        </div>

        <div id="modalEditIndividu" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:1000; justify-content:center; align-items:center;">
            <div style="background:white; padding:25px; border-radius:12px; width:90%; max-width:750px; max-height:90vh; overflow-y:auto;">
                <h3 style="margin-top:0; border-bottom:2px solid #f1f5f9; padding-bottom:10px;">✏️ Kemaskini RPH & Refleksi</h3>
                <div id="kandunganEditRPH" style="margin-top:15px;"></div>
                <div style="text-align:right; margin-top:25px; border-top:1px solid #eee; padding-top:20px;">
                    <button id="btnSimpanIndividu" style="background:#10b981; color:white; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer;">💾 Simpan Perubahan</button>
                    <button id="closeModalEdit" style="background:#64748b; color:white; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; margin-left:10px;">Batal</button>
                </div>
            </div>
        </div>

        <div id="modalEditPukal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:1000; justify-content:center; align-items:center;">
            <div style="background:#f8fafc; padding:25px; border-radius:12px; width:95%; max-width:900px; max-height:90vh; overflow-y:auto;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0; color:#1e293b;">📝 Kemaskini Refleksi Secara Pukal</h3>
                    <button id="closeModalPukalTop" style="background:none; border:none; font-size:24px; cursor:pointer; color:#64748b;">&times;</button>
                </div>
                
                <div style="background:#fff; padding:20px; border-radius:10px; border:1px solid #cbd5e1; margin-bottom:20px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-weight:bold; color:#3b82f6; margin-bottom:10px; display:flex; align-items:center; gap:8px;">
                        <span>⚡ Fungsi Salin Cepat:</span>
                    </div>
                    <p style="font-size:13px; color:#64748b; margin-top:0;">Taip refleksi di bawah dan klik butang salin untuk masukkan ke semua borang sekaligus.</p>
                    <textarea id="teksPukalSama" rows="2" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;" placeholder="Contoh: PdP ditangguhkan kerana mesyuarat..."></textarea>
                    <button id="btnGunaSemua" style="margin-top:10px; background:#3b82f6; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:13px;">Salin ke Semua Borang ↓</button>
                </div>

                <div id="senaraiBorangPukal"></div>

                <div style="margin-top:25px; text-align:right; border-top:2px solid #e2e8f0; padding-top:20px; position:sticky; bottom:0; background:#f8fafc;">
                    <button id="btnSimpanSemuaPukal" style="background:#10b981; color:white; border:none; padding:15px 30px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:16px; box-shadow:0 4px 6px rgba(16,185,129,0.2);">💾 Simpan Semua Rekod</button>
                    <button id="closeModalPukal" style="background:#64748b; color:white; border:none; padding:15px 25px; border-radius:8px; cursor:pointer; margin-left:10px; font-weight:bold;">Batal</button>
                </div>
            </div>
        </div>

        <div id="modalGC" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:1000; justify-content:center; align-items:center;">
            <div style="background:white; padding:25px; border-radius:12px; width:90%; max-width:600px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.2);">
                <h3 style="margin-top:0; border-bottom:2px solid #10b981; padding-bottom:10px; color:#065f46;">🏫 Terbit ke Google Classroom</h3>
                
                <div id="statusLoadGC" style="color:#2563eb; font-weight:bold; margin-bottom:15px; font-size:14px;">⏳ Memuat turun data...</div>
                
                <div id="formGC" style="display:none;">
                    <div style="margin-bottom:15px;">
                        <label style="display:block; font-weight:bold; margin-bottom:5px;">1. Pilih Kelas:</label>
                        <select id="pilihKelasGC" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:14px;">
                            <option value="">-- Sila Pilih Kelas --</option>
                        </select>
                    </div>

                    <div style="margin-bottom:15px;">
                        <label style="display:block; font-weight:bold; margin-bottom:5px;">3. Tajuk Fail PDF:</label>
                        <input type="text" id="tajukPosGC" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px;" placeholder="Contoh: RPH_SJH_AHMAD_M10">
                    </div>

                    <div style="margin-bottom:15px;">
                        <label style="display:block; font-weight:bold; margin-bottom:5px;">4. Arahan / Nota (Pilihan):</label>
                        <textarea id="arahanPosGC" rows="3" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px;" placeholder="Contoh: RPH untuk pemantauan minggu ini."></textarea>
                    </div>
                </div>

                <div style="text-align:right; margin-top:25px; border-top:1px solid #eee; padding-top:20px;">
                    <button id="btnTerbitGC" style="background:#10b981; color:white; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer;" disabled>🚀 Terbit ke GC</button>
                    <button id="closeModalGC" style="background:#64748b; color:white; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; margin-left:10px;">Batal</button>
                </div>
            </div>
        </div>
        <style>@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }</style>
    `;

    // 2. Ambil data dari server
    fetchSenaraiRPH(user.email);

    // 3. Event Listeners (Pengikat Butang)
    document.getElementById('btnKembaliSejarah').onclick = () => {
        document.getElementById('guru-module-container').style.display = 'none';
        document.getElementById('guru-menu').style.display = 'grid';
    };

    document.getElementById('closeModal').onclick = () => {
        document.getElementById('modalRPH').style.display = 'none';
    };

    document.getElementById('closeModalEdit').onclick = () => {
        document.getElementById('modalEditIndividu').style.display = 'none';
    };

    const closeModalPukal = () => {
        document.getElementById('modalEditPukal').style.display = 'none';
    };
    document.getElementById('closeModalPukal').onclick = closeModalPukal;
    document.getElementById('closeModalPukalTop').onclick = closeModalPukal;

    document.getElementById('btnKemaskiniPukal').onclick = bukaModalPukal;
    document.getElementById('btnHantarPukal').onclick = hantarPukal;
    
    // PENGIKAT BUTANG AI PUKAL BARU
    document.getElementById('btnJanaAIPukal').onclick = janaObjektifAIPukal;

    document.getElementById('btnCetakPukal').onclick = () => {
        const dipilih = getPilihanData();
        cetakRPH(dipilih);
    };

    document.getElementById('btnHantarGC').onclick = bukaModalGC;
    document.getElementById('closeModalGC').onclick = () => {
        document.getElementById('modalGC').style.display = 'none';
    };
    document.getElementById('btnTerbitGC').onclick = terbitKeGC;

    document.getElementById('chkPilihSemua').onchange = (e) => {
        const checkboxes = document.querySelectorAll('.chk-rph');
        checkboxes.forEach(chk => chk.checked = e.target.checked);
        semakButangPukal();
    };

    document.getElementById('btnResetTapis').onclick = () => {
        document.getElementById('tarikhMulaTapis').value = '';
        document.getElementById('tarikhAkhirTapis').value = '';
        renderSenaraiRPH(dataRPHGlobal);
    };

    // FUNGSI TAPISAN
    document.getElementById('btnTapisSenarai').onclick = () => {
        const mula = document.getElementById('tarikhMulaTapis').value;
        const akhir = document.getElementById('tarikhAkhirTapis').value;

        if (!mula || !akhir) {
            alert("Sila pilih kedua-dua tarikh mula dan akhir.");
            return;
        }

        const numMula = parseInt(mula.replace(/-/g, ''));
        const numAkhir = parseInt(akhir.replace(/-/g, ''));

        const filtered = dataRPHGlobal.filter(rph => {
            let tarikhAsal = rph.tarikh ? String(rph.tarikh) : "";
            let match = tarikhAsal.match(/\d+/g);
            let numRPH = 0;

            if (match && match.length >= 3) {
                if (match[0].length === 4) {
                    numRPH = parseInt(`${match[0]}${match[1].padStart(2, '0')}${match[2].padStart(2, '0')}`);
                } else {
                    let tahun = match[2].length === 2 ? "20" + match[2] : match[2];
                    numRPH = parseInt(`${tahun}${match[1].padStart(2, '0')}${match[0].padStart(2, '0')}`);
                }
            }
            return (numRPH >= numMula && numRPH <= numAkhir);
        });

        if (filtered.length === 0) {
            alert("Tiada rekod RPH ditemui. Sila pastikan tahun pada carian adalah betul (Contoh: 2026).");
        }
        renderSenaraiRPH(filtered);
    };

// ==========================================
    // FUNGSI JANA AI SECARA PUKAL (BARU)
    // ==========================================
    async function janaObjektifAIPukal() {
        // Ambil RPH yang dipilih dan pastikan ia berstatus 'Draf'
        const dataDipilih = getPilihanData().filter(r => r.status === 'Draf');
        if (dataDipilih.length === 0) {
            alert("Sila pilih sekurang-kurangnya satu RPH berstatus 'Draf' untuk dijana.");
            return;
        }

        // Kira anggaran masa (5 saat per RPH)
        const anggaranMasa = dataDipilih.length * 5;
        if (!confirm(`🤖 Sistem akan menjana objektif AI untuk ${dataDipilih.length} RPH.\n\nProses ini akan mengambil masa lebih kurang ${anggaranMasa} saat.\n\nSila pastikan anda TIDAK menutup tetingkap atau menekan butang 'Refresh' semasa proses berjalan. Teruskan?`)) return;

        // Buka skrin loading
        document.getElementById('modalAIPukalProgress').style.display = 'flex';
        const statusTeks = document.getElementById('teksStatusAIPukal');
        
        let senaraiDikemaskini = [];

        // Gelung For (Satu persatu, bukan serentak)
        for (let i = 0; i < dataDipilih.length; i++) {
            let rph = dataDipilih[i];
            
            statusTeks.innerHTML = `Membaca RPH ${i + 1} daripada ${dataDipilih.length}...<br><span style="font-size:16px; color:#a855f7;">Tajuk: ${rph.tajuk || rph.subjek}</span>`;

            try {
                // Ekstrak data untuk dihantar ke AI
                let tajukData = rph.tajuk || "Tiada Tajuk";
                let skData = rph.sk ? (Array.isArray(rph.sk) ? rph.sk.join(', ') : rph.sk) : "Tiada SK";
                let spData = rph.sp ? (Array.isArray(rph.sp) ? rph.sp.join(', ') : rph.sp) : "Tiada SP";

                const response = await fetch(API_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'janaObjektifAI',
                        tajuk: tajukData,
                        sk: skData,
                        sp: spData
                    })
                });
                const result = await response.json();

                if (result.success) {
                    // Masukkan hasil AI ke dalam array rph.objektif (pecahkan by enter)
                    rph.objektif = result.data.split('\n').filter(line => line.trim() !== "");
                    senaraiDikemaskini.push(rph);
                } else {
                    console.error("Gagal menjana RPH ID:", rph.idRPH, result.message);
                }
            } catch (e) {
                console.error("Ralat pelayan untuk RPH ID:", rph.idRPH, e);
            }

            // REHAT 4 SAAT SEBELUM MULA RPH SETERUSNYA (Sangat penting!)
            if (i < dataDipilih.length - 1) {
                statusTeks.innerHTML = `✅ Objektif RPH ${i + 1} berjaya dirangka!<br><span style="font-size:16px; color:#f59e0b;">Menyejukkan enjin AI selama 4 saat...</span>`;
                await new Promise(resolve => setTimeout(resolve, 4000));
            }
        }

        statusTeks.innerHTML = `🎉 Selesai merangka!<br><span style="font-size:16px; color:#10b981;">Menyimpan data ke pangkalan...</span>`;
        
        // Simpan semua RPH yang dah dikemaskini ke server Google Sheet
        if (senaraiDikemaskini.length > 0) {
            await hantarKemaskiniKeServer(senaraiDikemaskini);
        } else {
            alert("Tiada RPH yang berjaya dijana oleh AI. Sila cuba sebentar lagi.");
            document.getElementById('modalAIPukalProgress').style.display = 'none';
        }
    }


    // ==========================================
    // FUNGSI-FUNGSI DALAMAN SISTEM (Sedia Ada)
    // ==========================================
    async function fetchSenaraiRPH(email) {
        const statusEl = document.getElementById('senarai-status');
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'getSenaraiRPH', email: email })
            });
            const result = await response.json();

            if (result.success) {
                dataRPHGlobal = result.data;
                renderSenaraiRPH(dataRPHGlobal);
                document.getElementById('ruangPilihSemua').style.display = 'flex';
            } else {
                statusEl.innerText = "Tiada rekod dijumpai.";
            }
        } catch (error) {
            statusEl.innerText = "Ralat memuat data.";
            console.error(error);
        } finally {
            statusEl.style.display = 'none';
        }
    }

    function renderSenaraiRPH(senarai) {
        const container = document.getElementById('senarai-container');
        container.innerHTML = '';

        if (senarai.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:20px; color:#64748b;">Tiada rekod RPH ditemui.</p>';
            return;
        }

        senarai.forEach(rph => {
            const isDraf = rph.status === 'Draf';
            const card = document.createElement('div');
            const dataUntukCheckbox = encodeURIComponent(JSON.stringify(rph));
            
            card.style = `
                border: 1px solid #e2e8f0; 
                padding: 15px; 
                border-radius: 10px; 
                margin-bottom: 12px; 
                background: ${isDraf ? '#ffffff' : '#f0fdf4'}; 
                display: flex; 
                align-items: center;
                border-left: 5px solid ${isDraf ? '#f59e0b' : '#10b981'};
                transition: transform 0.2s;
            `;
            
            card.innerHTML = `
                <input type="checkbox" class="chk-rph" data-id="${rph.idRPH}" data-status="${rph.status}" value="${dataUntukCheckbox}" style="margin-right:15px; transform:scale(1.4); cursor:pointer;">
                <div style="flex-grow:1;">
                    <div style="font-weight:bold; color:#1e293b; font-size:15px;">${rph.tarikh} | ${rph.hari} | ${rph.masa}</div>
                    <div style="color:#64748b; font-size:13px; margin-top:3px;">${rph.subjek} - ${rph.kelas}</div>
                    <div style="font-size:12px; color:#94a3b8; margin-top:2px;">ID: ${rph.idRPH}</div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:10px; padding:3px 8px; border-radius:4px; font-weight:bold; background:${isDraf ? '#fef3c7' : '#dcfce3'}; color:${isDraf ? '#92400e' : '#166534'};">${rph.status.toUpperCase()}</span>
                    <button onclick="window.paparDetail('${rph.idRPH}')" style="background:#10b981; color:white; border:none; padding:7px 12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px;">Papar</button>
                    ${isDraf ? `<button onclick="window.bukaEdit('${rph.idRPH}')" style="background:#f59e0b; color:white; border:none; padding:7px 12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px;">Edit</button>` : ''}
                    ${isDraf ? `<button onclick="window.padamRPH('${rph.idRPH}')" style="background:#fee2e2; color:#b91c1c; border:none; padding:7px 10px; border-radius:6px; cursor:pointer; font-size:12px;">🗑️</button>` : ''}
                </div>
            `;
            container.appendChild(card);
        });

        document.querySelectorAll('.chk-rph').forEach(chk => {
            chk.onchange = semakButangPukal;
        });
    }

    function formatSenarai(data) {
        if (!data) return '-';
        if (Array.isArray(data)) {
            return `<ul style="margin:0; padding-left:18px;">${data.map(item => `<li>${item}</li>`).join('')}</ul>`;
        }
        return String(data).replace(/\n/g, '<br>');
    }

    function formatAktiviti(data) {
        if (!data) return '-';
        if (Array.isArray(data)) {
            return `<ul style="margin:0; padding-left:18px;">${data.map(item => {
                if (typeof item === 'object') {
                    return `<li><strong>${item.fase}:</strong> ${item.text}</li>`;
                }
                return `<li>${item}</li>`;
            }).join('')}</ul>`;
        }
        return String(data);
    }

    window.paparDetail = (id) => {
        const rph = dataRPHGlobal.find(r => String(r.idRPH) === String(id));
        if(!rph) return alert("Ralat: Data RPH tidak dijumpai.");

        const container = document.getElementById('kandunganPenuhRPH');
        container.innerHTML = `
            <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="margin:0; color:#1e293b;">Rancangan Pengajaran Harian</h2>
                <span style="color:#64748b; font-size:13px;">Status: <strong>${rph.status}</strong></span>
            </div>
            <table style="width:100%; font-size:14px; border-collapse:collapse; margin-bottom:20px;">
                <tr>
                    <td style="padding:8px; border:1px solid #e2e8f0; background:#f8fafc;" width="20%"><strong>Mata Pelajaran</strong></td>
                    <td style="padding:8px; border:1px solid #e2e8f0;">${rph.subjek}</td>
                    <td style="padding:8px; border:1px solid #e2e8f0; background:#f8fafc;" width="20%"><strong>Minggu / Hari</strong></td>
                    <td style="padding:8px; border:1px solid #e2e8f0;">- / ${rph.hari}</td>
                </tr>
                <tr>
                    <td style="padding:8px; border:1px solid #e2e8f0; background:#f8fafc;"><strong>Tarikh</strong></td>
                    <td style="padding:8px; border:1px solid #e2e8f0;">${rph.tarikh}</td>
                    <td style="padding:8px; border:1px solid #e2e8f0; background:#f8fafc;"><strong>Masa / Kelas</strong></td>
                    <td style="padding:8px; border:1px solid #e2e8f0;">${rph.masa} / ${rph.kelas}</td>
                </tr>
            </table>
            <div style="background:#f1f5f9; padding:12px; border-radius:6px; margin-bottom:15px; border-left:4px solid #3b82f6;">
                <strong>Tajuk:</strong> ${rph.tajuk}
            </div>
            <table style="width:100%; font-size:14px; line-height:1.6;">
                <tr><td width="25%" valign="top"><strong>Standard Kandungan</strong></td><td valign="top">: <div style="margin-top:-20px; margin-left:10px;">${formatSenarai(rph.sk)}</div></td></tr>
                <tr><td width="25%" valign="top"><strong>Standard Pembelajaran</strong></td><td valign="top">: <div style="margin-top:-20px; margin-left:10px;">${formatSenarai(rph.sp)}</div></td></tr>
            </table>
            <div style="background:#fffbeb; border-left:4px solid #f59e0b; padding:15px; border-radius:0 6px 6px 0; margin:15px 0;">
                <strong style="color:#92400e;">🎯 Objektif Pembelajaran:</strong>
                <div style="margin-top:8px;">${formatSenarai(rph.objektif)}</div>
            </div>
            <div style="background:#f8fafc; border-left:4px solid #64748b; padding:15px; border-radius:0 6px 6px 0; margin-bottom:15px;">
                <strong style="color:#1e293b;">📝 Aktiviti PdP:</strong>
                <div style="margin-top:8px;">${formatAktiviti(rph.aktiviti)}</div>
            </div>
            <table style="width:100%; font-size:14px; margin-bottom:20px; background:#f1f5f9; padding:10px; border-radius:8px;">
                <tr><td width="25%"><strong>BBM</strong></td><td>: ${formatSenarai(rph.bbm)}</td></tr>
                <tr><td><strong>Nilai Murni</strong></td><td>: ${formatSenarai(rph.nilai)}</td></tr>
            </table>
            <div style="background:#ecfdf5; border:1px solid #a7f3d0; padding:15px; border-radius:8px;">
                <strong style="color:#065f46;">📊 Refleksi / Ulasan Penyelia:</strong>
                <div style="margin-top:8px; font-style:italic;">
                    <strong>Refleksi Guru:</strong> ${rph.refleksi || '<span style="color:#94a3b8;">Belum diisi. Klik butang Edit untuk mengisi.</span>'}<br><br>
                    <strong>Ulasan Penyelia:</strong> <span style="color:#047857;">${rph.ulasanPenyelia || '-'}</span><br>
                    <strong>Tandatangan:</strong> <span style="color:#0f172a;">${rph.tandatangan || '-'}</span>
                </div>
            </div>
        `;
        document.getElementById('btnCetakIndividu').onclick = () => cetakRPH([rph]);
        document.getElementById('modalRPH').style.display = 'flex';
    };

    window.bukaEdit = (id) => {
        const rph = dataRPHGlobal.find(r => String(r.idRPH) === String(id));
        if(!rph) return alert("Ralat: Data RPH tidak dijumpai.");

        const container = document.getElementById('kandunganEditRPH');
        const refleksiAwal = (rph.refleksi && rph.refleksi.trim() !== "") ? rph.refleksi : getTemplatRefleksi(rph.subjek);

        container.innerHTML = `
            <div style="margin-bottom:15px;">
                <label style="display:block; font-weight:bold; margin-bottom:5px;">Tajuk PdP:</label>
                <input type="text" id="editTajuk" value="${rph.tajuk}" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block; font-weight:bold; margin-bottom:5px;">Objektif Pembelajaran (Satu baris satu objektif):</label>
                <textarea id="editObjektif" rows="4" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;">${Array.isArray(rph.objektif) ? rph.objektif.join('\n') : rph.objektif}</textarea>
<button type="button" id="btnAIObjektif" style="background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; padding: 5px 10px; border-radius: 4px; font-size: 12px; cursor: pointer; margin-top: 5px; font-weight: bold;">
    ✨ Baiki Objektif dengan AI
</button>
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block; font-weight:bold; margin-bottom:5px;">Aktiviti PdP (Satu baris satu aktiviti):</label>
                <textarea id="editAktiviti" rows="6" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;">${Array.isArray(rph.aktiviti) ? rph.aktiviti.map(a => typeof a === 'object' ? a.text : a).join('\n') : rph.aktiviti}</textarea>
            </div>
            <div style="background:#f0f9ff; padding:15px; border-radius:8px; border:1px solid #bae6fd;">
                <label style="display:block; font-weight:bold; margin-bottom:5px; color:#0369a1;">Refleksi / Impak:</label>
                <textarea id="editRefleksi" rows="4" style="width:100%; padding:10px; border:2px solid #3b82f6; border-radius:6px; font-family:inherit;">${refleksiAwal}</textarea>
                <small style="color:#64748b;">Tips: Nyatakan bilangan murid yang mencapai objektif.</small>
            </div>
        `;

        document.getElementById('btnSimpanIndividu').onclick = async () => {
            rph.tajuk = document.getElementById('editTajuk').value;
            rph.objektif = document.getElementById('editObjektif').value.split('\n').filter(line => line.trim() !== "");
            rph.aktiviti = document.getElementById('editAktiviti').value.split('\n').filter(line => line.trim() !== "");
            rph.refleksi = document.getElementById('editRefleksi').value;
            await hantarKemaskiniKeServer([rph]);
        };
        document.getElementById('modalEditIndividu').style.display = 'flex';
    };

    function bukaModalPukal() {
        const dataDipilih = getPilihanData();
        const container = document.getElementById('senaraiBorangPukal');
        container.innerHTML = '';

        dataDipilih.forEach((rph, index) => {
            const template = (rph.refleksi && rph.refleksi.trim() !== "") ? rph.refleksi : getTemplatRefleksi(rph.subjek);
            const borang = document.createElement('div');
            borang.style = "background:white; padding:15px; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:15px; box-shadow:0 1px 3px rgba(0,0,0,0.1);";
            borang.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">
                    <strong style="color:#1e293b;">#${index+1} | ${rph.kelas} | ${rph.tarikh}</strong>
                    <span style="font-size:12px; color:#64748b;">${rph.subjek}</span>
                </div>
                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px; color:#475569;">REFLEKSI:</label>
                <textarea class="teks-refleksi-pukal" data-id="${rph.idRPH}" rows="3" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;">${template}</textarea>
            `;
            container.appendChild(borang);
        });

        document.getElementById('btnGunaSemua').onclick = () => {
            const teks = document.getElementById('teksPukalSama').value;
            if(!teks) return alert("Sila taip sesuatu pada ruangan Salin Cepat.");
            document.querySelectorAll('.teks-refleksi-pukal').forEach(area => area.value = teks);
        };

        document.getElementById('btnSimpanSemuaPukal').onclick = async () => {
            const senaraiBaru = dataDipilih.map(rph => {
                const area = document.querySelector(`.teks-refleksi-pukal[data-id="${rph.idRPH}"]`);
                return { ...rph, refleksi: area.value };
            });
            await hantarKemaskiniKeServer(senaraiBaru);
        };
        document.getElementById('modalEditPukal').style.display = 'flex';
    }

// ==========================================
    // FUNGSI HANTAR KEMASKINI KE SERVER (KEMASKINI)
    // ==========================================
    async function hantarKemaskiniKeServer(senarai) {
        const user = JSON.parse(localStorage.getItem('eRPH_User'));
        const btnIndividu = document.getElementById('btnSimpanIndividu');
        const btnPukal = document.getElementById('btnSimpanSemuaPukal');
        if(btnIndividu) btnIndividu.disabled = true;
        if(btnPukal) btnPukal.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'kemaskiniRPH',
                    emailGuru: user.email,
                    dataUpdate: senarai
                })
            });
            const result = await response.json();
            
            if (result.success) {
                alert("✅ Rekod berjaya dikemaskini!");

                // ==========================================
                // KOD BARU: KEMASKINI MEMORI LOKAL SUPAYA DATA TAK BERTINDIH
                // ==========================================
                if (typeof dataRPHGlobal !== 'undefined') {
                    senarai.forEach(dataBaru => {
                        let indeks = dataRPHGlobal.findIndex(r => r.idRPH === dataBaru.idRPH);
                        if (indeks !== -1) {
                            // Gabungkan memori lama dengan data yang baru dikemaskini
                            dataRPHGlobal[indeks] = { ...dataRPHGlobal[indeks], ...dataBaru };
                        }
                    });
                }
                // ==========================================
                
                // 1. Tutup modal Pukal Refleksi
                const modalPukal = document.getElementById('modalEditPukal');
                if (modalPukal) modalPukal.style.display = 'none';
                
                // 2. Tutup modal Edit Individu
                const modalIndividu = document.getElementById('modalEditIndividu');
                if (modalIndividu) modalIndividu.style.display = 'none';

                // 3. Tutup modal AI Pukal Progress
                const modalAIPukal = document.getElementById('modalAIPukalProgress');
                if (modalAIPukal) modalAIPukal.style.display = 'none';

                // 4. Kemaskini jadual tanpa refresh web penuh
                const btnSemak = document.getElementById('btnSemak'); 
                if (btnSemak) {
                    btnSemak.click(); 
                } else {
                    const carianMula = document.getElementById('carianMula');
                    if (carianMula) carianMula.dispatchEvent(new Event('change'));
                }
                
                if(btnIndividu) btnIndividu.disabled = false;
                if(btnPukal) btnPukal.disabled = false;

            } else {
                alert("Gagal mengemaskini: " + result.message);
            }
        } catch (e) {
            alert("Ralat sambungan server.");
        }
    }

    window.padamRPH = async (id) => {
        if(!confirm("⚠️ PERHATIAN: Adakah anda pasti mahu memadam RPH ini secara kekal? Tindakan ini tidak boleh dibatalkan.")) return;
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'padamRPH', idRPH: id })
            });
            const result = await response.json();
            if(result.success) {
                alert("Rekod telah dipadam.");
                initSejarahModule(); // Refresh list
            }
        } catch (e) {
            alert("Gagal memadam rekod.");
        }
    };

    async function hantarPukal() {
        const dataDipilih = getPilihanData();
        const idList = dataDipilih.map(r => r.idRPH);
        const user = JSON.parse(localStorage.getItem('eRPH_User'));
        const namaGuru = user.nama || user.email;

        if(!confirm(`Anda akan menghantar ${idList.length} RPH kepada penyelia. Selepas dihantar, draf ini tidak boleh diedit atau dipadam lagi. Teruskan?`)) return;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ 
                    action: 'hantarPenyeliaPukal', 
                    idList: idList,
                    namaGuru: namaGuru
                })
            });
            const result = await response.json();
            if(result.success) {
                alert("Semua RPH yang dipilih telah berjaya dihantar dan ditandatangani.");
                initSejarahModule(); // Refresh list
            }
        } catch (e) {
            alert("Ralat semasa proses penghantaran.");
        }
    }

    function cetakRPH(dataArray) {
        if(!dataArray || dataArray.length === 0) return;
        const printWindow = window.open('', '_blank');
        let html = `
        <html>
        <head>
            <title>Cetak RPH</title>
            <style>
                @media print { .no-print { display: none; } }
                body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; color: #000; }
                .rph-container { page-break-after: always; border: 1.5px solid #000; padding: 30px; margin-bottom: 20px; position: relative; }
                .title { text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                th, td { border: 1px solid #000; padding: 10px; text-align: left; vertical-align: top; }
                .bg-grey { background-color: #f2f2f2 !important; -webkit-print-color-adjust: exact; }
            </style>
        </head>
        <body>
            <div class="no-print" style="background:#fff3cd; padding:10px; margin-bottom:20px; border:1px solid #ffeeba; border-radius:5px; text-align:center;">
                <strong>ARAHAN:</strong> Tekan <b>Ctrl + P</b> atau butang Cetak pada pelayar anda. Pastikan "Background Graphics" ditanda dalam tetapan cetakan.
            </div>
        `;

        dataArray.forEach(rph => {
            html += `
            <div class="rph-container">
                <div class="title">RANCANGAN PENGAJARAN HARIAN</div>
                <table>
                    <tr>
                        <td class="bg-grey" width="20%"><b>MATA PELAJARAN</b></td>
                        <td width="30%">${rph.subjek}</td>
                        <td class="bg-grey" width="20%"><b>TARIKH / HARI</b></td>
                        <td width="30%">${rph.tarikh} (${rph.hari})</td>
                    </tr>
                    <tr>
                        <td class="bg-grey"><b>MASA</b></td>
                        <td>${rph.masa}</td>
                        <td class="bg-grey"><b>KELAS</b></td>
                        <td>${rph.kelas}</td>
                    </tr>
                    <tr>
                        <td class="bg-grey"><b>TAJUK</b></td>
                        <td colspan="3">${rph.tajuk}</td>
                    </tr>
                </table>
                <div style="margin-bottom:10px;">
                    <b>STANDARD KANDUNGAN:</b><br>${formatSenarai(rph.sk)}
                </div>
                <div style="margin-bottom:10px;">
                    <b>STANDARD PEMBELAJARAN:</b><br>${formatSenarai(rph.sp)}
                </div>
                <div style="margin-bottom:15px; border:1px solid #000; padding:10px;">
                    <b>OBJEKTIF PEMBELAJARAN:</b><br>${formatSenarai(rph.objektif)}
                </div>
                <div style="margin-bottom:15px;">
                    <b>AKTIVITI PENGAJARAN & PEMBELAJARAN (PdP):</b><br>${formatAktiviti(rph.aktiviti)}
                </div>
                <table>
                    <tr>
                        <td class="bg-grey" width="20%"><b>BBM</b></td>
                        <td>${Array.isArray(rph.bbm) ? rph.bbm.join(', ') : rph.bbm}</td>
                    </tr>
                    <tr>
                        <td class="bg-grey"><b>NILAI MURNI</b></td>
                        <td>${Array.isArray(rph.nilai) ? rph.nilai.join(', ') : rph.nilai}</td>
                    </tr>
                </table>
                <div style="margin-top:20px; border:1px solid #000; padding:15px; min-height:80px;">
                    <b>REFLEKSI / IMPAK:</b><br>${rph.refleksi || ''}<br><br>
                    <strong>Catatan Penyelia:</strong> ${rph.ulasanPenyelia || ''}
                </div>
                <div style="margin-top:30px; display:flex; justify-content:space-between;">
                    <div style="text-align:center; width:200px; font-size:10px;">
                        <br><i>${rph.tandatanganGuru || ''}</i><br>--------------------------<br>Tandatangan Guru
                    </div>
                    <div style="text-align:center; width:250px;">
                        <br><i>${rph.tandatangan || ''}</i><br>--------------------------<br>Tandatangan Penyelia
                    </div>
                </div>
            </div>
            `;
        });

        html += `</body><script>window.print();</script></html>`;
        printWindow.document.write(html);
        printWindow.document.close();
    }

    function getTemplatRefleksi(subjek) {
        const s = subjek.toLowerCase();
        if (s.includes('inggeris') || s.includes('english')) {
            return "____ out of ____ pupils were able to achieve the learning objectives. \n\nPdPc was postponed due to: ";
        }
        return "____ daripada ____ orang murid dapat mencapai objektif pembelajaran. \n\nPdP ditangguhkan kerana: ";
    }

    function getPilihanData() {
        const checkboxes = document.querySelectorAll('.chk-rph:checked');
        return Array.from(checkboxes).map(chk => JSON.parse(decodeURIComponent(chk.value)));
    }

    // UPDATE SEMAK BUTANG - TAMBAH BUTANG AI PUKAL
    function semakButangPukal() {
        const terpilih = document.querySelectorAll('.chk-rph:checked');
        const jumlahTerpilih = terpilih.length;
        const adaDraf = Array.from(terpilih).some(chk => chk.getAttribute('data-status') === 'Draf');

        document.getElementById('btnCetakPukal').style.display = jumlahTerpilih > 0 ? 'inline-block' : 'none';
        document.getElementById('btnHantarGC').style.display = jumlahTerpilih > 0 ? 'inline-block' : 'none';
        document.getElementById('btnKemaskiniPukal').style.display = adaDraf ? 'inline-block' : 'none';
        document.getElementById('btnHantarPukal').style.display = adaDraf ? 'inline-block' : 'none';
        document.getElementById('btnJanaAIPukal').style.display = adaDraf ? 'inline-block' : 'none'; // Tunjuk kalau ada Draf
    }

async function bukaModalGC() {
        const dataDipilih = getPilihanData();
        if (dataDipilih.length === 0) {
            alert("⚠️ Sila pilih sekurang-kurangnya satu RPH sebelum menerbitkan ke GC.");
            return;
        }
        const adaDraf = dataDipilih.some(r => r.status === 'Draf');
        if (adaDraf) {
            alert("⚠️ Terdapat RPH berstatus 'Draf'. Sila pastikan semua RPH telah disahkan oleh pentadbir.");
            return;
        }

        document.getElementById('modalGC').style.display = 'flex';
        document.getElementById('statusLoadGC').style.display = 'block';
        document.getElementById('formGC').style.display = 'none';
        
        const selectKelas = document.getElementById('pilihKelasGC');
        const btnTerbit = document.getElementById('btnTerbitGC');

        selectKelas.innerHTML = '<option value="">-- Sila Pilih Kelas --</option>';
        btnTerbit.disabled = true; // Butang Terbit dikunci selagi Kelas belum dipilih

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'getKelasGC' })
            });
            const result = await response.json();
            if (result.success && result.data.length > 0) {
                result.data.forEach(kelas => {
                    selectKelas.innerHTML += `<option value="${kelas.id}">${kelas.nama}</option>`;
                });
                document.getElementById('statusLoadGC').style.display = 'none';
                document.getElementById('formGC').style.display = 'block';
            } else {
                document.getElementById('statusLoadGC').innerText = "❌ Tiada kelas dijumpai di Google Classroom anda.";
            }
        } catch (e) {
            document.getElementById('statusLoadGC').innerText = "❌ Ralat sambungan API.";
        }

        // Apabila guru menukar pilihan kelas, sistem hanya perlu "Buka Kunci" butang terbit.
        // Tidak perlu lagi memuat turun senarai topik!
        selectKelas.onchange = () => {
            const idKelas = selectKelas.value;
            if (!idKelas) {
                btnTerbit.disabled = true;
            } else {
                btnTerbit.disabled = false;
            }
        };
    }

async function terbitKeGC() {
        const idKelas = document.getElementById('pilihKelasGC').value;
        // const idTopik = document.getElementById('pilihTopikGC').value; <-- (BARIS INI DIBUANG)
        const tajukPos = document.getElementById('tajukPosGC').value.trim();
        const arahanPos = document.getElementById('arahanPosGC').value.trim();

        // Buang '!idTopik' dari syarat di bawah, dan tukar ayat alert
        if (!idKelas || !tajukPos) {
            alert("⚠️ Sila lengkapkan pilihan Kelas dan Tajuk.");
            return;
        }

        const dataDipilih = getPilihanData();
        const btnTerbit = document.getElementById('btnTerbitGC');
        btnTerbit.innerText = "⏳ Sedang Menjana & Menghantar...";
        btnTerbit.disabled = true;

        let gabunganHTML = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: auto;">`;
        dataDipilih.forEach((rph, index) => {
            gabunganHTML += `
                <div style="margin-bottom: 50px; ${index !== dataDipilih.length - 1 ? 'page-break-after: always;' : ''}">
                    <h2 style="text-align:center; text-decoration:underline;">RANCANGAN PELAJARAN HARIAN</h2>
                    
                    <table style="width:100%; border-collapse:collapse; margin-top:20px;" border="1" cellpadding="8">
                        <tr><td style="width:30%; font-weight:bold; background:#f8fafc;">Tarikh / Hari</td><td>${rph.tarikh} (${rph.hari})</td></tr>
                        <tr><td style="font-weight:bold; background:#f8fafc;">Masa</td><td>${rph.masa}</td></tr>
                        <tr><td style="font-weight:bold; background:#f8fafc;">Kelas / Subjek</td><td>${rph.kelas} - ${rph.subjek}</td></tr>
                        <tr><td style="font-weight:bold; background:#f8fafc;">Tajuk / Tema</td><td>${rph.tajuk || '-'}</td></tr>
                        <tr><td style="font-weight:bold; background:#f8fafc;">Standard Kandungan</td><td>${formatSenarai(rph.sk)}</td></tr>
                        <tr><td style="font-weight:bold; background:#f8fafc;">Standard Pembelajaran</td><td>${formatSenarai(rph.sp)}</td></tr>
                        <tr><td style="font-weight:bold; background:#f8fafc;">Objektif Pembelajaran</td><td>${formatSenarai(rph.objektif)}</td></tr>
                        <tr><td style="font-weight:bold; background:#f8fafc;">Aktiviti PdP</td><td>${formatAktiviti(rph.aktiviti)}</td></tr>
                        <tr><td style="font-weight:bold; background:#f8fafc;">BBM</td><td>${rph.bbm ? (Array.isArray(rph.bbm) ? rph.bbm.join(', ') : rph.bbm) : '-'}</td></tr>
                        <tr><td style="font-weight:bold; background:#f8fafc;">Refleksi</td><td>${rph.refleksi ? String(rph.refleksi).replace(/\n/g, '<br>') : '-'}</td></tr>
                    </table>

// Bahagian Catatan / Ulasan
<div style="margin-top:15px; border:1px solid #000; padding:10px; min-height:60px; background-color:#f8fafc; font-size: 14px;">
    <strong>Catatan / Ulasan Penyelia:</strong><br>
    ${rph.ulasanPenyelia && rph.ulasanPenyelia !== "" ? String(rph.ulasanPenyelia).replace(/\n/g, '<br>') : '<i>Tiada ulasan buat masa ini.</i>'}
</div>

// Bahagian Tandatangan
<table style="width:100%; margin-top:15px; border:none; text-align:center; font-size: 12px;">
    <tr>
        <td style="width:50%; border:none; vertical-align:bottom; padding: 5px;">
            <div style="font-style: italic; color:#1e293b; margin-bottom:5px;">${rph.tandatanganGuru || ''}</div>
            ----------------------------------------<br>
            <b>Tandatangan Guru</b>
        </td>
        <td style="width:50%; border:none; vertical-align:bottom; padding: 5px;">
            <div style="font-style: italic; color:#1e293b; margin-bottom:5px;">${rph.tandatangan || ''}</div>
            ----------------------------------------<br>
            <b>Tandatangan Penyelia</b>
        </td>
    </tr>
</table>
                </div>
            `;
        });
        gabunganHTML += `</div>`;

try {
            const user = JSON.parse(localStorage.getItem('eRPH_User'));
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ 
                    action: 'terbitRPHkeGC', 
                    idKelas: idKelas,
                    // topicId: idTopik,  <-- (Dibisukan kerana Topik kini automatik)
                    tajuk: tajukPos,
                    arahan: arahanPos,
                    htmlData: gabunganHTML,
                    namaFail: "RPH_" + user.nama.replace(/ /g, '_') + "_" + new Date().getTime(),
                    namaGuru: user.nama  // <--- TAMBAHAN WAJIB DI SINI
                })
            });
            const result = await response.json();
            if (result.success) {
                // Tunjuk mesej dari pelayan (akan papar "Berjaya diterbitkan ke dalam topik: RPH - Nama Guru")
                alert(result.message); 
                document.getElementById('modalGC').style.display = 'none';
            } else {
                alert("❌ Ralat: " + result.message);
            }
        } catch (e) {
            alert("❌ Ralat Pelayan: Gagal berhubung dengan sistem.");
        } finally {
            btnTerbit.innerText = "🚀 Terbit ke GC";
            btnTerbit.disabled = false;
        }
    }
}

// =========================================================
// KOD TAMBAHAN: FUNGSI BUTANG AI (INDIVIDU - SELAMAT)
// =========================================================
document.addEventListener('click', async function(e) {
    if (e.target && e.target.id === 'btnAIObjektif') {
        const btn = e.target;
        
        const kotakObjektif = document.getElementById('editObjektif');
        const tajuk = document.getElementById('editTajuk') ? document.getElementById('editTajuk').value : "Tiada Tajuk";
        const sk = document.getElementById('editSK') ? document.getElementById('editSK').value : "Tiada SK";
        const sp = document.getElementById('editSP') ? document.getElementById('editSP').value : "Tiada SP";

        const teksAsal = btn.innerHTML;
        btn.innerHTML = "⏳ AI sedang merangka ayat...";
        btn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'janaObjektifAI',
                    tajuk: tajuk,
                    sk: sk,
                    sp: sp
                })
            });
            const result = await response.json();

            if (result.success) {
                kotakObjektif.value = result.data;
                kotakObjektif.style.backgroundColor = "#fdf4ff"; 
                setTimeout(() => kotakObjektif.style.backgroundColor = "", 1500);
            } else {
                alert("Gagal menjana AI: " + result.message);
            }
        } catch (error) {
            alert("Ralat sambungan ke pelayan AI.");
        } finally {
            btn.innerHTML = teksAsal;
            btn.disabled = false;
        }
    }
});
