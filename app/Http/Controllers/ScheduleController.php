<?php

namespace App\Http\Controllers;

use App\Models\Editor;
use App\Models\Fotografer;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        $schedules = Schedule::with(['fotografer', 'editor'])
            ->latest('tanggal')
            ->latest('jamMulai')
            ->get();

        return Inertia::render('Admin/Laporan', compact('schedules'));
    }

    public function create()
    {
        return Inertia::render('Admin/Schedule/TambahSchedule', [
            'fotografers' => Fotografer::all(),
            'editors'     => Editor::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateSchedule($request);

        try {
            Schedule::create($this->prepareScheduleData($validated));
            return redirect()->route('schedule.index')->with('success', 'Schedule berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function show(Schedule $schedule)
    {
        return Inertia::render('Admin/Schedule/DetailSchedule', [
            'schedule' => $schedule->load(['fotografer', 'editor'])
        ]);
    }

    public function edit(Schedule $schedule)
    {
        return Inertia::render('Admin/Schedule/EditSchedule', [
            'schedule'    => $schedule,
            'fotografers' => Fotografer::all(),
            'editors'     => Editor::all(),
        ]);
    }

    public function update(Request $request, Schedule $schedule)
    {
        $validated = $this->validateSchedule($request, true);

        try {
            $schedule->update($this->prepareScheduleData($validated, $schedule));
            return redirect()->route('schedule.index')->with('success', 'Schedule berhasil diupdate.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function destroy(Schedule $schedule)
    {
        $schedule->delete();
        return redirect()->route('schedule.index')->with('success', 'Schedule berhasil dihapus.');
    }

    public function updateStatus(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed'
        ]);

        $schedule->update(['status' => $validated['status']]);
        return back()->with('success', 'Status berhasil diupdate.');
    }

    /**
     * VALIDASI
     */
    private function validateSchedule(Request $request, bool $isUpdate = false): array
    {
        return $request->validate([
            'tanggal'       => $isUpdate ? 'required|date' : 'required|date|after_or_equal:today',
            'jamMulai'      => 'nullable|date_format:H:i',
            'jamSelesai'    => 'nullable|date_format:H:i',
            'namaEvent'     => 'required|string|max:255',
            'fotografer_id' => 'nullable|exists:fotografers,id',
            // 'editor_id'     => 'nullable|exists:editors,id',
            'lapangan'      => 'nullable|string|max:255',
            'catatan'       => 'nullable|string',
            'linkGdriveFotografer' => 'nullable|url',
            'linkGdriveEditor'     => 'nullable|url',
        ]);
    }

    /**
     * PERSIAPAN DATA: hitung jam, durasi, status
     */
    private function prepareScheduleData(array $validated, ?Schedule $schedule = null): array
    {
        $tanggalMulai = null;
        $tanggalSelesai = null;
        $durasiJam = null;
        $status = $schedule->status ?? 'pending';

        if (!empty($validated['jamMulai']) && !empty($validated['jamSelesai'])) {
            [$tanggalMulai, $tanggalSelesai, $durasiJam] = $this->processScheduleTime(
                $validated['tanggal'],
                $validated['jamMulai'],
                $validated['jamSelesai']
            );

            $status = $this->determineStatus(now('Asia/Jakarta'), $tanggalMulai, $tanggalSelesai);
        }

        return array_merge($validated, [
            'status'        => $status,
            'jamFotografer' => !empty($validated['fotografer_id']) ? $durasiJam : 0,
            'jamEditor'     => !empty($validated['editor_id']) ? $durasiJam : 0,
        ]);
    }

    /**
     * HITUNG DURASI (selalu positif, handle lewat tengah malam)
     */
    private function processScheduleTime(string $tanggal, string $jamMulaiStr, string $jamSelesaiStr): array
    {
        $timezone = 'Asia/Jakarta';
        $jamMulai = Carbon::createFromFormat('H:i', $jamMulaiStr);
        $jamSelesai = Carbon::createFromFormat('H:i', $jamSelesaiStr);

        $tanggalMulai   = Carbon::createFromFormat('Y-m-d H:i', "$tanggal $jamMulaiStr", $timezone);
        $tanggalSelesai = Carbon::createFromFormat('Y-m-d H:i', "$tanggal $jamSelesaiStr", $timezone);

        if ($jamSelesai->lte($jamMulai)) {
            $tanggalSelesai->addDay(); // jika lewat tengah malam
        }

        $durasiMenit = $tanggalMulai->diffInMinutes($tanggalSelesai);
        $durasiJam   = round($durasiMenit / 60, 2);

        return [$tanggalMulai, $tanggalSelesai, $durasiJam];
    }

    private function determineStatus(Carbon $now, Carbon $tanggalMulai, Carbon $tanggalSelesai): string
    {
        return $now->lt($tanggalMulai) ? 'pending'
            : ($now->between($tanggalMulai, $tanggalSelesai) ? 'in_progress' : 'completed');
    }
}
