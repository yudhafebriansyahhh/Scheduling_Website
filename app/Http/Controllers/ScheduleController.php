<?php

namespace App\Http\Controllers;

use App\Models\Editor;
use App\Models\Fotografer;
use App\Models\Schedule;
use App\Models\ScheduleFotograferAssist;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        $schedules = Schedule::with(['fotografer', 'editor', 'assists.fotografer'])
            ->latest('tanggal')
            ->latest('jamMulai')
            ->get()
            ->map(function ($schedule) {
                $schedule->status = $this->determineStatus(
                    $schedule->tanggal->format('Y-m-d'),
                    $schedule->jamMulai,
                    $schedule->jamSelesai
                );
                return $schedule;
            });

        // Transform data untuk role "assist" - buat row terpisah untuk setiap assist
        // Assist adalah fotografer yang membantu fotografer utama
        $assistSchedules = collect();

        foreach ($schedules as $schedule) {
            if ($schedule->assists && $schedule->assists->count() > 0) {
                // Untuk setiap assist, buat row terpisah
                foreach ($schedule->assists as $assist) {
                    $assistSchedule = $schedule->replicate();
                    $assistSchedule->id = $schedule->id; // Keep original ID
                    $assistSchedule->currentAssist = $assist; // Add current assist info
                    $assistSchedule->jamAssist = $assist->jamAssist;
                    $assistSchedule->assistFotografer = $assist->fotografer; // Fotografer yang jadi assist
                    $assistSchedule->isAssistRow = true; // Flag untuk membedakan
                    $assistSchedule->mainFotografer = $schedule->fotografer; // Fotografer utama
                    $assistSchedules->push($assistSchedule);
                }
            }
        }

        return Inertia::render('Admin/Laporan', [
            'schedules' => $schedules,
            'assistSchedules' => $assistSchedules
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Schedule/TambahSchedule', [
            'fotografers' => Fotografer::all(),
            'editors' => Editor::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateSchedule($request);

        try {
            $schedule = Schedule::create($this->prepareScheduleData($validated));

            // Simpan assistants ke tabel terpisah
            if (!empty($validated['assistants'])) {
                foreach ($validated['assistants'] as $assistant) {
                    if (!empty($assistant['fotografer_id']) && !empty($assistant['jamAssist'])) {
                        ScheduleFotograferAssist::create([
                            'schedule_id' => $schedule->id,
                            'fotografer_id' => $assistant['fotografer_id'],
                            'jamAssist' => $assistant['jamAssist']
                        ]);
                    }
                }
            }

            return redirect()->route('schedule.index')->with('success', 'Schedule berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function show(Schedule $schedule)
    {
        $schedule->load(['fotografer', 'editor', 'assists.fotografer']);
        $schedule->status = $this->determineStatus(
            $schedule->tanggal->format('Y-m-d'),
            $schedule->jamMulai,
            $schedule->jamSelesai
        );

        return Inertia::render('Admin/Schedule/DetailSchedule', [
            'schedule' => $schedule
        ]);
    }

    public function edit(Schedule $schedule)
    {
        $schedule->load(['assists.fotografer']);
        $status = $this->determineStatus(
            $schedule->tanggal->format('Y-m-d'),
            $schedule->jamMulai,
            $schedule->jamSelesai
        );

        $scheduleData = [
            'id' => $schedule->id,
            'tanggal' => $schedule->tanggal->format('Y-m-d'),
            'jamMulai' => $schedule->jamMulai,
            'jamSelesai' => $schedule->jamSelesai,
            'namaEvent' => $schedule->namaEvent,
            'fotografer_id' => $schedule->fotografer_id,
            'editor_id' => $schedule->editor_id,
            'jamEditor' => $schedule->jamEditor,
            'lapangan' => $schedule->lapangan,
            'catatan' => $schedule->catatan,
            'status' => $status, // dihitung realtime
            'jamFotografer' => $schedule->jamFotografer,
            'assistants' => $schedule->assists->map(function ($assist) {
                return [
                    'fotografer_id' => $assist->fotografer_id,
                    'jamAssist' => $assist->jamAssist,
                ];
            })->toArray()
        ];

        return Inertia::render('Admin/Schedule/EditSchedule', [
            'schedule' => $scheduleData,
            'fotografers' => Fotografer::all(),
            'editors' => Editor::all(),
        ]);
    }

    public function update(Request $request, Schedule $schedule)
    {
        $validated = $this->validateSchedule($request, true);

        \DB::beginTransaction();
        try {
            $schedule->update($this->prepareScheduleData($validated, $schedule));

            // Reset assistants
            $schedule->assists()->delete();
            if (!empty($validated['assistants'])) {
                foreach ($validated['assistants'] as $assistant) {
                    if (!empty($assistant['fotografer_id']) && !empty($assistant['jamAssist'])) {
                        ScheduleFotograferAssist::create([
                            'schedule_id' => $schedule->id,
                            'fotografer_id' => $assistant['fotografer_id'],
                            'jamAssist' => $assistant['jamAssist']
                        ]);
                    }
                }
            }

            \DB::commit();
            return redirect()->route('schedule.index')->with('success', 'Schedule berhasil diupdate.');
        } catch (\Exception $e) {
            \DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function destroy(Schedule $schedule)
    {
        $schedule->delete();
        return redirect()->route('schedule.index')->with('success', 'Schedule berhasil dihapus.');
    }

    private function validateSchedule(Request $request, bool $isUpdate = false): array
    {
        return $request->validate([
            'tanggal' => $isUpdate ? 'required|date' : 'required|date|after_or_equal:today',
            'jamMulai' => 'required|date_format:H:i',
            'jamSelesai' => 'required|date_format:H:i',
            'namaEvent' => 'required|string|max:255',
            'fotografer_id' => 'required|exists:fotografers,id',
            'editor_id' => 'nullable|exists:editors,id',
            'jamEditor' => 'nullable|numeric|min:0',
            'lapangan' => 'required|string|max:255',
            'catatan' => 'nullable|string',
            'assistants' => 'nullable|array',
            'assistants.*.fotografer_id' => 'nullable|exists:fotografers,id',
            'assistants.*.jamAssist' => 'nullable|numeric|min:0',
        ]);
    }

    private function prepareScheduleData(array $validated, ?Schedule $schedule = null): array
    {
        $durasiJam = 0;

        if (!empty($validated['jamMulai']) && !empty($validated['jamSelesai'])) {
            $durasiJam = $this->calculateDuration($validated['jamMulai'], $validated['jamSelesai']);
        }

        $scheduleData = collect($validated)->except(['assistants'])->toArray();

        return array_merge($scheduleData, [
            'jamFotografer' => $durasiJam,
            // ⚠️ status tidak disimpan, dihitung on the fly
        ]);
    }

    private function calculateDuration(string $jamMulai, string $jamSelesai): float
    {
        $start = Carbon::createFromFormat('H:i', $jamMulai);
        $end = Carbon::createFromFormat('H:i', $jamSelesai);

        if ($end->lte($start)) {
            $end->addDay();
        }

        return round($start->diffInMinutes($end) / 60, 1);
    }

    private function determineStatus($tanggal, string $jamMulai, string $jamSelesai): string
    {
        $now = now('Asia/Jakarta');

        // pastikan tanggal jadi format Y-m-d string
        if ($tanggal instanceof Carbon) {
            $tanggal = $tanggal->format('Y-m-d');
        }

        $scheduleStart = Carbon::createFromFormat('Y-m-d H:i:s', "{$tanggal} {$jamMulai}", 'Asia/Jakarta');
        $scheduleEnd   = Carbon::createFromFormat('Y-m-d H:i:s', "{$tanggal} {$jamSelesai}", 'Asia/Jakarta');

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
