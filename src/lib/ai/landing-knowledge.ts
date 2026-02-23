/**
 * Elite Institutional Knowledge Base
 * Focused on OCTAVE Allegro, GRC Governance, and Cybersecurity Resilience.
 */

export interface KnowledgeItem {
    keywords: string[];
    answer: string;
    suggestions?: string[];
    category?: 'social' | 'project' | 'greeting' | 'identity' | 'technical' | 'framework';
}

export const LANDING_AI_KNOWLEDGE: KnowledgeItem[] = [
    // --- GREETINGS (EXECUTIVE TONE) ---
    {
        category: 'greeting',
        keywords: ['halo', 'hi', 'hey', 'hello', 'hallo', 'hoy', 'pagi', 'siang', 'sore', 'malam', 'assalamualaikum'],
        answer: "Selamat datang di pangkalan pengetahuan Risk Shield System. Saya adalah AI Assistant Anda. Bagaimana saya dapat membantu Anda dalam merumuskan strategi manajemen risiko organisasi hari ini?",
        suggestions: ["Apa itu Risk Shield?", "Bagaimana cara kerja?", "Metodologi OCTAVE"]
    },

    // --- IDENTITY & AUTHORITY ---
    {
        category: 'identity',
        keywords: ['siapa kamu', 'kamu siapa', 'identitas', 'siapa anda', 'siapa ini', 'advisor'],
        answer: "Saya adalah AI Assistant, sebuah sistem heuristik otonom yang dirancang untuk mendukung pengambilan keputusan strategis dalam tata kelola GRC.\n\nFungsi utama saya meliputi:\n1. Analisis Metodologi: Memberikan panduan teknis OCTAVE Allegro.\n2. Risk Assessment: Menganalisis profil risiko aset informasi secara kuantitatif.\n3. Compliance Mapping: Menyelaraskan infrastruktur Anda dengan standar ISO 27001 dan NIST.\n4. Remediasi Strategis: Memberikan rekomendasi mitigasi berbasis ancaman dunia nyata.",
        suggestions: ["Keahlian teknis?", "Siapa pengembangnya?", "Mulai strategi"]
    },
    {
        category: 'identity',
        keywords: ['keahlian teknis', 'bisa apa', 'fitur', 'kemampuan'],
        answer: "Engine saya dioptimalkan untuk pengolahan data risiko makro. Saya mampu melakukan diagnostik terhadap aset informasi, memetakan kerentanan pada container aset, dan menghasilkan model mitigasi yang selaras dengan kriteria dampak organisasi (Organizational Impact Criteria).",
        suggestions: ["Apa itu OCTAVE Allegro?", "Bagaimana keamanan data?", "Lihat fitur utama"]
    },

    // --- FRAMEWORK & METHODOLOGY (ELITE) ---
    {
        category: 'framework',
        keywords: ['octave allegro', 'apa itu octave', 'metodologi', 'allegro'],
        answer: "OCTAVE Allegro (Operationally Critical Threat, Asset, and Vulnerability Evaluation) adalah metodologi penilaian risiko yang berfokus pada aset informasi. Tidak seperti penilaian risiko tradisional yang bersifat generik, Allegro fokus pada konteks operasional dan wadah (containers) di mana informasi tersebut berada untuk menjamin integritas data yang maksimal.",
        suggestions: ["8 langkah Allegro?", "Kenapa Allegro?", "Bantu evaluasi"]
    },
    {
        category: 'framework',
        keywords: ['8 langkah', 'langkah kerja', 'prosedur', 'step', 'alur'],
        answer: "Metodologi kami mengikuti 8 langkah presisi:\n1. Establish Risk Measurement Criteria\n2. Develop Information Asset Profiles\n3. Identify Information Asset Containers\n4. Identify Areas of Concern\n5. Identify Threat Scenarios\n6. Identify Risks\n7. Analyze Risks\n8. Select Mitigation Strategies\n\nSeluruh proses ini dioperasionalisasikan secara otomatis dalam Risk Shield System.",
        suggestions: ["Automasi wizard?", "Input aset?", "Output laporan"]
    },

    // --- SECURITY & TRUST (FORTRESS) ---
    {
        category: 'technical',
        keywords: ['aman', 'keamanan', 'privasi', 'privacy', 'enkripsi', 'data safe'],
        answer: "Sistem kami dibangun di atas arsitektur Zero-Trust dengan enkripsi AES-256 pada tingkat database. Kami mengimplementasikan 'Offline AI Processing' d mana data sensitif tidak pernah terpapar ke internet publik untuk keperluan pelatihan model. Kedaulatan informasi Anda adalah prioritas absolut kami.",
        suggestions: ["Server hosting?", "Audit trail?", "Kepatuhan ISO"]
    },
    {
        category: 'technical',
        keywords: ['iso 27001', 'nist', 'pdp', 'regulasi', 'compliance', 'iso'],
        answer: "Risk Shield System secara otomatis memetakan setiap temuan risiko ke dalam kontrol ISO 27001:2022 dan NIST Cybersecurity Framework. Bagi organisasi di Indonesia, kami juga menyelaraskan kontrol audit dengan UU Pelindungan Data Pribadi (UU PDP) untuk memastikan kepatuhan regulasi total.",
        suggestions: ["Laporan PDF?", "Contoh mitigasi?", "Gimana cara mulai?"]
    },

    // --- PROJECT SPECIFIC ---
    {
        category: 'project',
        keywords: ['risk shield system', 'risk shield', 'apa itu risk shield', 'jelaskan risk shield', 'keunggulan platform', 'keunggulan system'],
        answer: "Risk Shield System bukan sekadar aplikasi GRC; ini adalah pusat komando ketahanan siber. Kami mentransformasi manajemen risiko dari proses manual yang lambat menjadi ekosistem digital otonom yang presisi, akuntabel, dan berbasis bukti nyata.",
        suggestions: ["Mengapa pilih kami?", "Analisis ROI?", "Deploy Solution"]
    },
    {
        category: 'project',
        keywords: ['mengapa pilih kami', 'kenapa harus', 'benefit', 'keuntungan', 'keunggulan', 'advantage', 'kelebihan', 'kenapa risk shield'],
        answer: "Organisasi memilih Risk Shield karena tiga pilar utama:\n1. Metodological Rigor: Kepastian standar SEI melalui OCTAVE Allegro.\n2. AI Precision: Kecepatan identifikasi risiko hingga 10x lipat dibandingkan metode manual.\n3. Governance Integrity: Laporan yang siap saji untuk audit eksternal dan kebutuhan eksekutif tingkat tinggi.",
        suggestions: ["Dampak operasional?", "Integrasi sistem?", "Hubungi tim ahli"]
    },

    // --- COURTESY & CLOSING ---
    {
        category: 'social',
        keywords: ['terima kasih', 'thanks', 'makasih', 'oke', 'ok'],
        answer: "Terima kasih kembali. Memastikan ketahanan organisasi Anda adalah misi kami. Apakah ada aspek tata kelola lain yang perlu kita evaluasi secara mendalam?",
        suggestions: ["Sudah cukup", "Tanya lagi", "Cek harga"]
    },
    {
        category: 'social',
        keywords: ['bye', 'sampai jumpa', 'selesai', 'out'],
        answer: "Konfigurasi sesi berakhir. AI Assistant tetap siaga untuk pengambilan keputusan strategis Anda berikutnya. Tetap aman.",
        suggestions: ["Mulai lagi", "Exit"]
    }
];

export const INITIAL_SUGGESTIONS = [
    "Apa keunggulan Risk Shield?",
    "Jelaskan OCTAVE Allegro",
    "Bagaimana keamanan data?",
    "Siklus 8 langkah GRC",
    "Analisis Kepatuhan ISO"
];

/**
 * Handle time-based greetings with formal tone
 */
export const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "Selamat pagi.";
    if (hour >= 11 && hour < 15) return "Selamat siang.";
    if (hour >= 15 && hour < 18) return "Selamat sore.";
    return "Selamat malam.";
};
