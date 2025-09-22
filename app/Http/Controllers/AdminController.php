<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Fotografer;
use App\Models\Editor;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function index()
    {
        $now = Carbon::now();

        // Ambil data schedule dengan relasi
        $schedules = Schedule::with(['fotografer', 'editor'])
            ->orderBy('tanggal', 'desc')
            ->orderBy('jamMulai', 'desc')
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'tanggal' => $schedule->tanggal->format('Y-m-d'),
                    'jamMulai' => $schedule->jamMulai,
                    'jamSelesai' => $schedule->jamSelesai,
                    'namaEvent' => $schedule->namaEvent,
                    'team' => $schedule->team ?? null,
                    'lapangan' => $schedule->lapangan,
                    'status' => $this->determineStatus($schedule->tanggal, $schedule->jamMulai, $schedule->jamSelesai),
                    'catatan' => $schedule->catatan,
                    'fotografer' => $schedule->fotografer?->nama ?? null,
                    'editor' => $schedule->editor?->nama ?? null,
                    'location' => $schedule->lapangan,
                ];
            });

        // Siapkan data event untuk calendar
        $events = $schedules->filter(fn($schedule) => !empty($schedule['tanggal']))
            ->map(function ($schedule) {
                return [
                    'id' => $schedule['id'],
                    'title' => $schedule['namaEvent'] ?? 'Event',
                    'date' => $schedule['tanggal'],
                ];
            })
            ->values();

        // Statistik
        $stats = [
            'jadwal_bulan_ini' => Schedule::whereMonth('tanggal', $now->month)
                ->whereYear('tanggal', $now->year)
                ->count(),
            'total_fotografer' => Fotografer::count(),
            'total_editor' => Editor::count(),
        ];

        return Inertia::render('Admin/Dasboard', [
            'schedules' => $schedules,
            'events' => $events,
            'stats' => $stats,
        ]);
    }

    public function getSchedulesByDate(Request $request)
    {
        $date = $request->get('date');

        $schedules = Schedule::with(['fotografer', 'editor'])
            ->where('tanggal', $date)
            ->orderBy('jamMulai')
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'tanggal' => $schedule->tanggal->format('Y-m-d'),
                    'jamMulai' => $schedule->jamMulai,
                    'jamSelesai' => $schedule->jamSelesai,
                    'namaEvent' => $schedule->namaEvent,
                    'lapangan' => $schedule->lapangan,
                    'status' => $this->determineStatus($schedule->tanggal, $schedule->jamMulai, $schedule->jamSelesai),
                    'fotografer' => $schedule->fotografer?->nama ?? null,
                    'editor' => $schedule->editor?->nama ?? null,
                    'location' => $schedule->lapangan,
                ];
            });

        return response()->json($schedules);
    }

    /**
     * Menentukan status schedule secara otomatis
     */
    private function determineStatus($tanggal, string $jamMulai, string $jamSelesai): string
    {
        $now = now('Asia/Jakarta');

        if ($tanggal instanceof Carbon) {
            $tanggal = $tanggal->format('Y-m-d');
        }

        // FIX: pakai H:i:s karena field DB time disimpan dengan detik
        $scheduleStart = Carbon::createFromFormat('Y-m-d H:i:s', "{$tanggal} {$jamMulai}", 'Asia/Jakarta');
        $scheduleEnd   = Carbon::createFromFormat('Y-m-d H:i:s', "{$tanggal} {$jamSelesai}", 'Asia/Jakarta');

        // Antisipasi kalau jam selesai lebih kecil dari jam mulai (lewat tengah malam)
        if ($scheduleEnd->lte($scheduleStart)) {
            $scheduleEnd->addDay();
        }

        if ($now->lt($scheduleStart)) {
            return 'pending';
        } elseif ($now->between($scheduleStart, $scheduleEnd)) {
            return 'in_progress';
        } else {
            return 'completed';
        }
    }
}
