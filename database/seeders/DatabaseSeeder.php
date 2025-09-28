<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Fotografer;
use App\Models\Editor;
use App\Models\Schedule;
use App\Models\ScheduleFotograferAssist;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Admin User
        $admin = User::create([
            'name' => 'Admin Yudha',
            'email' => 'yudha@gmail.com',
            'password' => Hash::make('12345678'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // 2. Create Fotografer Users & Profiles
        $fotograferUsers = [
            [
                'name' => 'Ahmad Rizki',
                'email' => 'ahmad.rizki@gmail.com',
                'alamat' => 'Jl. Sudirman No. 123, Jakarta Pusat',
                'no_hp' => '081234567890'
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@gmail.com',
                'alamat' => 'Jl. Thamrin No. 456, Jakarta Pusat',
                'no_hp' => '081234567891'
            ],
            [
                'name' => 'Citra Dewi',
                'email' => 'citra.dewi@gmail.com',
                'alamat' => 'Jl. Gatot Subroto No. 789, Jakarta Selatan',
                'no_hp' => '081234567892'
            ],
            [
                'name' => 'Dedi Kurniawan',
                'email' => 'dedi.kurniawan@gmail.com',
                'alamat' => 'Jl. Rasuna Said No. 321, Jakarta Selatan',
                'no_hp' => '081234567893'
            ],
            [
                'name' => 'Eka Pratama',
                'email' => 'eka.pratama@gmail.com',
                'alamat' => 'Jl. HR Rasuna Said No. 654, Jakarta Selatan',
                'no_hp' => '081234567894'
            ],
            [
                'name' => 'Fajar Nugroho',
                'email' => 'fajar.nugroho@gmail.com',
                'alamat' => 'Jl. Kemang Raya No. 987, Jakarta Selatan',
                'no_hp' => '081234567895'
            ]
        ];

        foreach ($fotograferUsers as $fotograferData) {
            $user = User::create([
                'name' => $fotograferData['name'],
                'email' => $fotograferData['email'],
                'password' => Hash::make('password123'), // Default password
                'role' => 'fotografer',
                'email_verified_at' => now(),
            ]);

            Fotografer::create([
                'user_id' => $user->id,
                'nama' => $fotograferData['name'],
                'alamat' => $fotograferData['alamat'],
                'email' => $fotograferData['email'],
                'no_hp' => $fotograferData['no_hp'],
            ]);
        }

        // 3. Create Editor Users & Profiles
        $editorUsers = [
            [
                'name' => 'Gita Sari',
                'email' => 'gita.sari@gmail.com',
                'alamat' => 'Jl. Menteng Raya No. 111, Jakarta Pusat',
                'no_hp' => '081234567896'
            ],
            [
                'name' => 'Hendra Wijaya',
                'email' => 'hendra.wijaya@gmail.com',
                'alamat' => 'Jl. Cikini Raya No. 222, Jakarta Pusat',
                'no_hp' => '081234567897'
            ],
            [
                'name' => 'Indira Putri',
                'email' => 'indira.putri@gmail.com',
                'alamat' => 'Jl. Tebet Raya No. 333, Jakarta Selatan',
                'no_hp' => '081234567898'
            ],
            [
                'name' => 'Joko Susilo',
                'email' => 'joko.susilo@gmail.com',
                'alamat' => 'Jl. Pancoran No. 444, Jakarta Selatan',
                'no_hp' => '081234567899'
            ]
        ];

        foreach ($editorUsers as $editorData) {
            $user = User::create([
                'name' => $editorData['name'],
                'email' => $editorData['email'],
                'password' => Hash::make('password123'), // Default password
                'role' => 'editor',
                'email_verified_at' => now(),
            ]);

            Editor::create([
                'user_id' => $user->id,
                'nama' => $editorData['name'],
                'alamat' => $editorData['alamat'],
                'email' => $editorData['email'],
                'no_hp' => $editorData['no_hp'],
            ]);
        }

        // 4. Create Schedule Data
        $fotografers = Fotografer::all();
        $editors = Editor::all();

        $scheduleData = [
            [
                'tanggal' => Carbon::today()->addDays(1),
                'jamMulai' => '09:00',
                'jamSelesai' => '12:00',
                'namaEvent' => 'Wedding Ceremony - Sarah & David',
                'lapangan' => 'Grand Ballroom Hotel Mulia',
                'catatan' => 'Persiapan dekorasi mulai jam 08:00'
            ],
            [
                'tanggal' => Carbon::today()->addDays(2),
                'jamMulai' => '14:00',
                'jamSelesai' => '18:00',
                'namaEvent' => 'Corporate Event PT. Indonesia Maju',
                'lapangan' => 'Auditorium Gedung Sate',
                'catatan' => 'Live streaming diperlukan'
            ],
            [
                'tanggal' => Carbon::today()->subDays(1),
                'jamMulai' => '08:00',
                'jamSelesai' => '15:00',
                'namaEvent' => 'Birthday Party Anak - Little Princess',
                'lapangan' => 'Taman Bermain Kids Zone',
                'catatan' => 'Tema princess, banyak foto candid anak-anak'
            ],
            [
                'tanggal' => Carbon::today(),
                'jamMulai' => '10:00',
                'jamSelesai' => '14:00',
                'namaEvent' => 'Product Launch Smartphone Terbaru',
                'lapangan' => 'Mall Central Park',
                'catatan' => 'Focus pada detail produk dan reaksi audience'
            ],
            [
                'tanggal' => Carbon::today()->addDays(5),
                'jamMulai' => '16:00',
                'jamSelesai' => '20:00',
                'namaEvent' => 'Graduation Ceremony University',
                'lapangan' => 'Aula Universitas Indonesia',
                'catatan' => 'Dokumentasi wisuda, foto individual dan kelompok'
            ],
            [
                'tanggal' => Carbon::today()->subDays(3),
                'jamMulai' => '07:00',
                'jamSelesai' => '11:00',
                'namaEvent' => 'Pre-Wedding Outdoor Session',
                'lapangan' => 'Kebun Raya Bogor',
                'catatan' => 'Golden hour session, bring reflector'
            ],
            [
                'tanggal' => Carbon::today()->addDays(7),
                'jamMulai' => '13:00',
                'jamSelesai' => '17:00',
                'namaEvent' => 'Fashion Show - Jakarta Fashion Week',
                'lapangan' => 'Senayan City Mall',
                'catatan' => 'Runway photography, backstage moments'
            ],
            [
                'tanggal' => Carbon::today()->addDays(3),
                'jamMulai' => '19:00',
                'jamSelesai' => '23:00',
                'namaEvent' => 'Concert Jazz Festival',
                'lapangan' => 'Istora Senayan',
                'catatan' => 'Low light photography, stage lighting'
            ]
        ];

        foreach ($scheduleData as $index => $data) {
            $fotografer = $fotografers->random();
            $editor = $editors->random();

            // Random chance untuk ada editor atau tidak (50% chance)
            $hasEditor = rand(0, 1) === 1;

            $schedule = Schedule::create([
                'tanggal' => $data['tanggal'],
                'jamMulai' => $data['jamMulai'],
                'jamSelesai' => $data['jamSelesai'],
                'namaEvent' => $data['namaEvent'],
                'fotografer_id' => $fotografer->id,
                'editor_id' => $hasEditor ? $editor->id : null, // ✅ Explicitly set to null if no editor
                'lapangan' => $data['lapangan'],
                'jamFotografer' => $this->calculateHours($data['jamMulai'], $data['jamSelesai']),
                'jamEditor' => $hasEditor ? (rand(2, 6) + 0.5 * rand(0, 1)) : 0, // Only set hours if has editor
                'catatan' => $data['catatan'],
            ]);

        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin Login: yudha@gmail.com / 12345678');
        $this->command->info('Fotografer/Editor Login: [email] / password123');
    }

    private function calculateHours($jamMulai, $jamSelesai)
    {
        $start = Carbon::createFromFormat('H:i', $jamMulai);
        $end = Carbon::createFromFormat('H:i', $jamSelesai);

        if ($end->lt($start)) {
            $end->addDay();
        }

        return round($start->diffInMinutes($end) / 60, 1);
    }
}
