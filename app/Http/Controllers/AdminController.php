<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Fotografer;
use App\Models\Editor;
use Inertia\Inertia;
use Carbon\Carbon;

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
                    'tanggal' => $schedule->tanggal, // Langsung ambil tanggal tanpa format
                    'jamMulai' => $schedule->jamMulai,
                    'jamSelesai' => $schedule->jamSelesai,
                    'namaEvent' => $schedule->namaEvent,
                    'team' => $schedule->team,
                    'lapangan' => $schedule->lapangan,
                    'status' => $schedule->status ?? 'pending',
                    'catatan' => $schedule->catatan,
                    'fotografer' => $schedule->fotografer?->nama ?? null,
                    'editor' => $schedule->editor?->nama ?? null,
                ];
            });

        // Siapkan data event untuk calendar
        $events = $schedules->filter(function ($schedule) {
                return !empty($schedule['tanggal']);
            })
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
}
