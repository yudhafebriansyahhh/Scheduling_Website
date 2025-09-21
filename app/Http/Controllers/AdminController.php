<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Schedule;
use App\Models\Fotografer;
use App\Models\Editor;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function index()
    {
        // Get current month data for stats
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        // Calculate stats
        $jadwalBulanIni = Schedule::whereMonth('tanggal', $currentMonth)
            ->whereYear('tanggal', $currentYear)
            ->count();

        $totalFotografer = Fotografer::count();
        $totalEditor = Editor::count();

        // Get schedules with related data
        $schedules = Schedule::with(['fotografer', 'editor'])
            ->orderBy('tanggal', 'desc')
            ->orderBy('jamMulai', 'asc')
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'date' => $schedule->tanggal,
                    'tanggal' => $schedule->tanggal instanceof \Carbon\Carbon ?
                        $schedule->tanggal->format('Y-m-d') :
                        Carbon::parse($schedule->tanggal)->format('Y-m-d'),
                    'jamMulai' => $schedule->jamMulai,
                    'jamSelesai' => $schedule->jamSelesai,
                    'waktu' => Carbon::parse($schedule->jamMulai)->format('H:i') . ' - ' .
                        Carbon::parse($schedule->jamSelesai)->format('H:i'),
                    'namaEvent' => $schedule->namaEvent,
                    'team' => $schedule->namaEvent, // Alias untuk komponen yang menggunakan 'team'
                    'namaTim' => $schedule->namaEvent, // Alias untuk komponen yang menggunakan 'namaTim'
                    'fotografer' => $schedule->fotografer ? $schedule->fotografer->nama : '-',
                    'fotografer_id' => $schedule->fotografer_id,
                    'editor' => $schedule->editor ? $schedule->editor->nama : '-',
                    'editor_id' => $schedule->editor_id,
                    'lapangan' => $schedule->lapangan,
                    'status' => $schedule->status,
                    'jamFotografer' => $schedule->jamFotografer,
                    'jamEditor' => $schedule->jamEditor,
                    'catatan' => $schedule->catatan,
                    'linkGdriveFotografer' => $schedule->linkGdriveFotografer,
                    'linkGdriveEditor' => $schedule->linkGdriveEditor,
                    'created_at' => $schedule->created_at,
                    'updated_at' => $schedule->updated_at,
                ];
            });

        // Generate events for calendar from schedules
        $events = $schedules->map(function ($schedule) {
            return [
                'id' => $schedule['id'],
                'date' => $schedule['tanggal'], // Pastikan format Y-m-d
                'title' => $schedule['namaEvent'],
                'team' => $schedule['namaEvent'],
                'time' => $schedule['waktu'],
                'fotografer' => $schedule['fotografer'],
                'editor' => $schedule['editor'],
                'lapangan' => $schedule['lapangan'],
                'status' => $schedule['status'],
                'description' => $schedule['catatan'] ?? 'Tidak ada deskripsi'
            ];
        })->toArray();

        // Debug logging
        \Log::info('📊 AdminController - Schedules count: ' . $schedules->count());
        \Log::info('📊 AdminController - Events count: ' . count($events));
        \Log::info('📊 AdminController - Sample schedule data: ', $schedules->take(2)->toArray());
        \Log::info('📊 AdminController - Sample events data: ', array_slice($events, 0, 2));

        // Additional stats for dashboard
        $totalSchedules = Schedule::count();
        $activeSchedules = Schedule::where('status', 'in_progress')->count();
        $completedSchedules = Schedule::where('status', 'completed')->count();
        $pendingSchedules = Schedule::where('status', 'pending')->count();

        // Today's schedules
        $todaySchedules = Schedule::with(['fotografer', 'editor'])
            ->whereDate('tanggal', Carbon::today())
            ->orderBy('jamMulai', 'asc')
            ->count();

        return inertia('Admin/Dashboard', [
            'stats' => [
                'jadwal_bulan_ini' => $jadwalBulanIni,
                'total_fotografer' => $totalFotografer,
                'total_editor' => $totalEditor,
                'total_schedules' => $totalSchedules,
                'active_schedules' => $activeSchedules,
                'completed_schedules' => $completedSchedules,
                'pending_schedules' => $pendingSchedules,
                'today_schedules' => $todaySchedules,
            ],
            'schedules' => $schedules->toArray(),
            'events' => $events,
            // Debug data
            'debug_info' => [
                'current_date' => Carbon::now()->format('Y-m-d'),
                'schedules_sample' => $schedules->take(3)->toArray(),
                'events_sample' => array_slice($events, 0, 3)
            ]
        ]);
    }

    // Method untuk mendapatkan jadwal berdasarkan tanggal (untuk AJAX request)
    public function getSchedulesByDate(Request $request)
    {
        $date = $request->input('date');

        $schedules = Schedule::with(['fotografer', 'editor'])
            ->orderBy('tanggal', 'desc')
            ->orderBy('jamMulai', 'asc')
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'tanggal' => $schedule->tanggal instanceof \Carbon\Carbon ?
                        $schedule->tanggal->format('Y-m-d') :
                        Carbon::parse($schedule->tanggal)->format('Y-m-d'),
                    'waktu' => Carbon::parse($schedule->jamMulai)->format('H:i') . ' - ' . Carbon::parse($schedule->jamSelesai)->format('H:i'),
                    'namaEvent' => $schedule->namaEvent,
                    'fotografer' => $schedule->fotografer ? $schedule->fotografer->nama : '-',
                    'editor' => $schedule->editor ? $schedule->editor->nama : '-',
                    'lapangan' => $schedule->lapangan,
                    'status' => $schedule->status,
                ];
            });

        return response()->json($schedules);
    }
}
