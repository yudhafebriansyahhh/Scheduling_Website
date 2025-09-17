<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Http\Requests\StoreScheduleRequest;
use App\Http\Requests\UpdateScheduleRequest;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
{
    $schedules = Schedule::with(['fotografer', 'editor'])
        ->orderBy('tanggal', 'desc') // ✅ ganti latest()
        ->get()
        ->map(function ($item) {
            $jamMulai = strtotime($item->jam_mulai);
            $jamSelesai = strtotime($item->jam_selesai);
            $totalJam = round(($jamSelesai - $jamMulai) / 3600, 1);

            return [
                'id' => $item->id,
                'tanggal' => $item->tanggal,
                'jamMulai' => $item->jam_mulai,
                'jamSelesai' => $item->jam_selesai,
                'namaTim' => $item->nama_event,
                'fotografer' => $item->fotografer?->name,
                'editor' => $item->editor?->name,
                'lapangan' => $item->lapangan,
                'status' => $item->status,
                'totalJam' => $totalJam,
                'jamFotografer' => $totalJam,
                'jamEditor' => $totalJam,
                'catatan' => $item->catatan ?? '-',
            ];
        });

    return Inertia::render('Admin/Laporan', [
        'laporanData' => $schedules,
    ]);
}


    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Schedules/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreScheduleRequest $request)
    {
        $data = $request->validated();

        $schedule = Schedule::create($data);

        return redirect()->route('schedules.index')
            ->with('success', 'Schedule berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(Schedule $schedule): Response
    {
        $schedule->jamFotografer = $this->calculateDuration($schedule->jam_mulai, $schedule->jam_selesai);
        $schedule->jamEditor = $this->calculateDuration($schedule->jam_mulai, $schedule->jam_selesai);

        return Inertia::render('Admin/Schedules/Show', [
            'schedule' => $schedule
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Schedule $schedule): Response
    {
        return Inertia::render('Admin/Schedules/Edit', [
            'schedule' => $schedule
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateScheduleRequest $request, Schedule $schedule)
    {
        $data = $request->validated();

        $schedule->update($data);

        return redirect()->route('schedules.index')
            ->with('success', 'Schedule berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Schedule $schedule): RedirectResponse
    {
        $schedule->delete();

        return redirect()->route('schedules.index')
            ->with('success', 'Schedule berhasil dihapus.');
    }

    /**
     * Hitung durasi antara jam mulai dan jam selesai dalam jam (decimal).
     */
    private function calculateDuration($jamMulai, $jamSelesai): float
    {
        $mulai = strtotime($jamMulai);
        $selesai = strtotime($jamSelesai);

        return round(($selesai - $mulai) / 3600, 2);
    }
}
