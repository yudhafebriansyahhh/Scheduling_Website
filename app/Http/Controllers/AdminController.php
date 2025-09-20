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

        // Ambil data schedule
        $schedules = Schedule::with(['fotografer', 'editor'])
            ->orderBy('tanggal', 'desc')
            ->orderBy('jamMulai', 'desc')
            ->get();

        // Siapkan data event untuk FullCalendar
        $events = $schedules->map(function ($s) {
            return [
                'id'    => $s->id,
                'title' => $s->namaEvent,
                'start' => $s->tanggal . ' ' . $s->jamMulai,
                'end'   => $s->tanggal . ' ' . $s->jamSelesai,
            ];
        });

        // Statistik
        $stats = [
            'jadwal_bulan_ini' => Schedule::whereMonth('tanggal', $now->month)
                ->whereYear('tanggal', $now->year)
                ->count(),
            'total_fotografer' => Fotografer::count(),
            'total_editor'     => Editor::count(),
        ];

        return Inertia::render('Admin/Dasboard', [
            'schedules' => $schedules,
            'events'    => $events,
            'stats'     => $stats,
        ]);
    }
}
