// assets/js/auth.js
// VERSI GOOGLE SHEETS (TANPA FIREBASE)

import { API_URL } from './config.js';

// =========================================================
// 1. FUNGSI LOG MASUK (LOGIN)
// =========================================================
export async function loginKeSheets(email, password) {
    try {
        console.log(`[Auth] Mencoba log masuk untuk: ${email}`);
        
        // Hantar request ke Google Apps Script
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'login',
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Jika berhasil, simpan data pengguna di localStorage
            localStorage.setItem('eRPH_User', JSON.stringify(data.user));
            
            // Tentukan Role Utama untuk keperluan routing
            let role = data.user.role.toLowerCase();
            if (role.includes('admin')) {
                localStorage.setItem('userRole', 'admin_sekolah');
            } else if (role.includes('penyelia')) {
                localStorage.setItem('userRole', 'penyelia');
            } else {
                localStorage.setItem('userRole', 'guru');
            }
            
            return { success: true };
        } else {
            return { success: false, message: data.message };
        }
        
    } catch (error) {
        console.error("Ralat Auth:", error);
        return { success: false, message: "Gagal berhubung dengan pelayan (Server Error)." };
    }
}

// =========================================================
// 2. FUNGSI LOG KELUAR (LOGOUT)
// =========================================================
export function logKeluar() {
    // Bersihkan sesi
    localStorage.removeItem('eRPH_User');
    localStorage.removeItem('userRole');
    
    alert("Anda telah berhasil log keluar.");
    window.location.href = "index.html"; // Arahkan kembali ke halaman utama
}

// =========================================================
// 3. FUNGSI MENDAFTAR AKAUN BARU
// =========================================================
export async function daftarKeSheets(nama, email, ic, peranan) {
    try {
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
        
        const data = await response.json();
        return data; // Pulangkan success & message
        
    } catch (error) {
        console.error("Ralat Daftar:", error);
        return { success: false, message: "Gagal berhubung dengan pelayan. Sila cuba sebentar lagi." };
    }
}