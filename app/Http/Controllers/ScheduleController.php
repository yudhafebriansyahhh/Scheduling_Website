<?php

namespace App\Http\Controllers;

use App\Models\Editor;
use App\Models\Fotografer;
use App\Models\Schedule;
use App\Rules\ValidTimeRange;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        $schedules = Schedule::with(['fotografer', 'editor'])
            ->orderBy('tanggal', 'desc')
            ->orderBy('jamMulai', 'desc')
            ->get();

        return Inertia::render('Admin/Laporan', [
            'schedules' => $schedules
        ]);
    }

    public function create()
    {
        $fotografers = Fotografer::all();
        $editors = Editor::all();

        return Inertia::render('Admin/Schedule/TambahSchedule', [
            'fotografers' => $fotografers,
            'editors' => $editors,
        ]);
    }

    public function store(Request $request)
    {
        // Validasi input (tanpa custom rule dulu)
        $validated = $request->validate([
            'tanggal'       => 'required|date|after_or_equal:today',
            'jamMulai'      => 'required|date_format:H:i',
            'jamSelesai'    => 'required|date_format:H:i',
            'namaEvent'     => 'required|string|max:255',
            'fotografer_id' => 'required|exists:fotografers,id',
            'editor_id'     => 'required|exists:editors,id',
            'lapangan'      => 'required|string|max:255',
            'catatan'       => 'nullable|string',
            'linkGdriveFotografer' => 'nullable|url',
            'linkGdriveEditor'     => 'nullable|url',
        ], [
            'tanggal.after_or_equal' => 'Tanggal tidak boleh mundur dari hari ini',
            'jamMulai.date_format' => 'Format jam mulai tidak valid (HH:MM)',
            'jamSelesai.date_format' => 'Format jam selesai tidak valid (HH:MM)',
        ]);

        // Manual validation untuk durasi waktu
        $jamMulai = Carbon::createFromFormat('H:i', $validated['jamMulai']);
        $jamSelesai = Carbon::createFromFormat('H:i', $validated['jamSelesai']);

        // Hitung durasi
        $durasiMenit = 0;
        if ($jamSelesai->gt($jamMulai)) {
            // Kasus normal: 21:00 - 23:00
            $durasiMenit = $jamSelesai->diffInMinutes($jamMulai);
        } else {
            // Kasus melewati hari: 23:00 - 01:00
            $jamSelesaiNextDay = $jamSelesai->copy()->addDay();
            $durasiMenit = $jamSelesaiNextDay->diffInMinutes($jamMulai);
        }

        // Validasi durasi
        if ($durasiMenit < 15) {
            return back()->withErrors([
                'jamSelesai' => 'Durasi event minimal 15 menit.'
            ])->withInput();
        }

        if ($durasiMenit > 1440) { // 24 jam
            return back()->withErrors([
                'jamSelesai' => 'Durasi event maksimal 24 jam.'
            ])->withInput();
        }

        // Set timezone ke Asia/Jakarta untuk konsistensi
        Carbon::setTestNow(null); // Reset jika ada test time
        $timezone = 'Asia/Jakarta';

        // Parse tanggal dan jam dengan timezone yang jelas
        $tanggalMulai = Carbon::createFromFormat(
            'Y-m-d H:i',
            $validated['tanggal'] . ' ' . $validated['jamMulai'],
            $timezone
        );

        $tanggalSelesai = Carbon::createFromFormat(
            'Y-m-d H:i',
            $validated['tanggal'] . ' ' . $validated['jamSelesai'],
            $timezone
        );

        // Jika jam selesai lebih kecil dari jam mulai, anggap melewati hari
        if ($jamSelesai->lte($jamMulai)) {
            $tanggalSelesai->addDay();
        }

        // Hitung durasi dalam jam dengan presisi desimal (menggunakan durasi yang sudah dihitung)
        $durasiJam = round($durasiMenit / 60, 2);

        // Tentukan status berdasarkan waktu sekarang
        $now = Carbon::now($timezone);
        $status = $this->determineStatus($now, $tanggalMulai, $tanggalSelesai);

        try {
            // Simpan ke database
            $schedule = Schedule::create([
                'tanggal'               => $validated['tanggal'],
                'jamMulai'              => $validated['jamMulai'],
                'jamSelesai'            => $validated['jamSelesai'],
                'namaEvent'             => $validated['namaEvent'],
                'fotografer_id'         => $validated['fotografer_id'],
                'editor_id'             => $validated['editor_id'],
                'lapangan'              => $validated['lapangan'],
                'status'                => $status,
                'jamFotografer'         => $durasiJam,
                'jamEditor'             => $durasiJam,
                'catatan'               => $validated['catatan'] ?? null,
                'linkGdriveFotografer'  => $validated['linkGdriveFotografer'] ?? null,
                'linkGdriveEditor'      => $validated['linkGdriveEditor'] ?? null,
            ]);

            return redirect()->route('schedule.index')
                ->with('success', 'Schedule berhasil ditambahkan.');

        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Tentukan status schedule berdasarkan waktu
     */
    private function determineStatus(Carbon $now, Carbon $tanggalMulai, Carbon $tanggalSelesai): string
    {
        if ($now->lt($tanggalMulai)) {
            return 'pending'; // Belum mulai
        } elseif ($now->between($tanggalMulai, $tanggalSelesai)) {
            return 'in_progress'; // Sedang berlangsung
        } else {
            return 'completed'; // Sudah selesai
        }
    }

    /**
     * Show schedule details
     */
    public function show(Schedule $schedule)
    {
        $schedule->load(['fotografer', 'editor']);

        return Inertia::render('Admin/Schedule/DetailSchedule', [
            'schedule' => $schedule
        ]);
    }

    /**
     * Show edit form
     */
    public function edit(Schedule $schedule)
    {
        $fotografers = Fotografer::all();
        $editors = Editor::all();

        return Inertia::render('Admin/Schedule/EditSchedule', [
            'schedule' => $schedule,
            'fotografers' => $fotografers,
            'editors' => $editors,
        ]);
    }

    /**
     * Update schedule
     */
    public function update(Request $request, Schedule $schedule)
    {
        // Validasi input
        $validated = $request->validate([
            'tanggal'       => 'required|date',
            'jamMulai'      => 'required|date_format:H:i',
            'jamSelesai'    => 'required|date_format:H:i',
            'namaEvent'     => 'required|string|max:255',
            'fotografer_id' => 'required|exists:fotografers,id',
            'editor_id'     => 'required|exists:editors,id',
            'lapangan'      => 'required|string|max:255',
            'catatan'       => 'nullable|string',
            'linkGdriveFotografer' => 'nullable|url',
            'linkGdriveEditor'     => 'nullable|url',
        ]);

        // Manual validation untuk durasi waktu
        $jamMulai = Carbon::createFromFormat('H:i', $validated['jamMulai']);
        $jamSelesai = Carbon::createFromFormat('H:i', $validated['jamSelesai']);

        // Hitung durasi
        $durasiMenit = 0;
        if ($jamSelesai->gt($jamMulai)) {
            // Kasus normal: 21:00 - 23:00
            $durasiMenit = $jamSelesai->diffInMinutes($jamMulai);
        } else {
            // Kasus melewati hari: 23:00 - 01:00
            $jamSelesaiNextDay = $jamSelesai->copy()->addDay();
            $durasiMenit = $jamSelesaiNextDay->diffInMinutes($jamMulai);
        }

        // Validasi durasi
        if ($durasiMenit < 15) {
            return back()->withErrors([
                'jamSelesai' => 'Durasi event minimal 15 menit.'
            ])->withInput();
        }

        if ($durasiMenit > 1440) { // 24 jam
            return back()->withErrors([
                'jamSelesai' => 'Durasi event maksimal 24 jam.'
            ])->withInput();
        }

        // Set timezone
        $timezone = 'Asia/Jakarta';

        // Parse tanggal dan jam
        $tanggalMulai = Carbon::createFromFormat(
            'Y-m-d H:i',
            $validated['tanggal'] . ' ' . $validated['jamMulai'],
            $timezone
        );

        $tanggalSelesai = Carbon::createFromFormat(
            'Y-m-d H:i',
            $validated['tanggal'] . ' ' . $validated['jamSelesai'],
            $timezone
        );

        // Handle jam selesai yang melewati hari
        if ($jamSelesai->lte($jamMulai)) {
            $tanggalSelesai->addDay();
        }

        // Hitung durasi (menggunakan durasi yang sudah dihitung)
        $durasiJam = round($durasiMenit / 60, 2);

        // Update status jika diperlukan
        $now = Carbon::now($timezone);
        $status = $this->determineStatus($now, $tanggalMulai, $tanggalSelesai);

        try {
            $schedule->update([
                'tanggal'               => $validated['tanggal'],
                'jamMulai'              => $validated['jamMulai'],
                'jamSelesai'            => $validated['jamSelesai'],
                'namaEvent'             => $validated['namaEvent'],
                'fotografer_id'         => $validated['fotografer_id'],
                'editor_id'             => $validated['editor_id'],
                'lapangan'              => $validated['lapangan'],
                'status'                => $status,
                'jamFotografer'         => $durasiJam,
                'jamEditor'             => $durasiJam,
                'catatan'               => $validated['catatan'] ?? null,
                'linkGdriveFotografer'  => $validated['linkGdriveFotografer'] ?? null,
                'linkGdriveEditor'      => $validated['linkGdriveEditor'] ?? null,
            ]);

            return redirect()->route('schedule.index')
                ->with('success', 'Schedule berhasil diupdate.');

        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Terjadi kesalahan saat mengupdate data: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Delete schedule
     */
    public function destroy(Schedule $schedule)
    {
        try {
            $schedule->delete();

            return redirect()->route('schedule.index')
                ->with('success', 'Schedule berhasil dihapus.');

        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat menghapus data: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update status schedule manually
     */
    public function updateStatus(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed'
        ]);

        try {
            $schedule->update([
                'status' => $validated['status']
            ]);

            return back()->with('success', 'Status berhasil diupdate.');

        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat mengupdate status: ' . $e->getMessage()
            ]);
        }
    }
}
