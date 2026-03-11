// assets/js/router.js
// VERSI GOOGLE SHEETS (TANPA FIREBASE)

// =========================================================
// 1. DEFINISI LALUAN (ROUTES)
// =========================================================
const routes = {
    'login': { id: 'login-screen', isApp: false },
    
    'school-admin-home': { 
        id: 'dashboard-screen', isApp: true,
        file: './admin/school-dashboard.js',
        func: 'loadSchoolAdminDashboard', targetId: 'main-content'
    },

    'penyelia-home': { 
        id: 'dashboard-screen', isApp: true,
        file: './penyelia/penyelia-main.js', 
        func: 'loadPenyeliaDashboard', targetId: 'main-content'
    },

    'guru-home': { 
        id: 'dashboard-screen', isApp: true,
        file: './guru/guru-main.js', 
        func: 'initGuruDashboard', targetId: 'main-content'
    }
};

let currentRoute = null;

// =========================================================
// 2. FUNGSI NAVIGASI
// =========================================================
export async function navigate(routeName) {
    const route = routes[routeName];
    if (!route) {
        console.error("Route tidak wujud:", routeName);
        return;
    }

    currentRoute = routeName;

    // Sembunyikan semua skrin
    document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
    
    // Paparkan skrin yang betul
    const screenEl = document.getElementById(route.id);
    if (screenEl) {
        screenEl.style.display = route.id === 'login-screen' ? 'flex' : 'block';
    }

    // Jika masuk ke dalam aplikasi (Dashboard)
    if (route.isApp && route.file) {
        try {
            const module = await import(route.file);
            if (module[route.func]) {
                // Beri sedikit masa untuk UI render sebelum jalankan fungsi
                setTimeout(() => module[route.func](), 50);
            }
        } catch (error) {
            console.error(`Gagal memuatkan modul ${route.file}:`, error);
        }
    }
}

// =========================================================
// 3. INIT ROUTER (PENGGANTI onAuthStateChanged)
// =========================================================
export function initRouter() {
    console.log("[Router] Menyemak sesi pengguna...");
    
    // Semak jika pengguna sudah log masuk sebelum ini
    const userDataStr = localStorage.getItem('eRPH_User');
    const userRole = localStorage.getItem('userRole');

    if (userDataStr && userRole) {
        // Pengguna sudah log masuk
        console.log(`[Router] Sesi dijumpai. Role: ${userRole}`);
        
        if (userRole === 'admin_sekolah' || userRole === 'admin') navigate('school-admin-home');
        else if (userRole === 'penyelia') navigate('penyelia-home');
        else navigate('guru-home');
        
    } else {
        // Belum log masuk, tunjuk skrin login
        navigate('login');
    }
}