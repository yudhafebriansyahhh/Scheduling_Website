<?php

namespace App\Http\Controllers;

use App\Models\Editor;
use App\Models\Fotografer;
use App\Models\Lapangan;
use App\Models\Schedule;
use App\Models\Assist;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        $schedules = Schedule::with(['fotografer', 'editor', 'lapangan'])
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

        $assists = Assist::with('assistable')
            ->latest('tanggal')
            ->latest('jamMulai')
            ->get()
            ->map(function ($assist) {
                $assist->status = $this->determineStatus(
                    $assist->tanggal instanceof Carbon ? $assist->tanggal->format('Y-m-d') : $assist->tanggal,
                    $assist->jamMulai,
                    $assist->jamSelesai
                );
                $assist->nama = $assist->assistable->nama ?? 'Unknown';
                return $assist;
            });

        return Inertia::render('Admin/Laporan', [
            'schedules' => $schedules,
            'assists' => $assists
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Schedule/TambahSchedule', [
            'fotografers' => Fotografer::all(),
            'editors' => Editor::all(),
            'lapangans' => Lapangan::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateSchedule($request);

        Schedule::create($this->prepareScheduleData($validated));

        return redirect()->route('schedule.index')->with('success', 'Schedule berhasil ditambahkan.');
    }

    public function show(Schedule $schedule)
    {
        $schedule->load(['fotografer', 'editor', 'lapangan']);
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
            'lapangan_id' => $schedule->lapangan_id,
            'catatan' => $schedule->catatan,
            'linkGdrive' => $schedule->linkGdrive,
            'status' => $status,
            'jamFotografer' => $schedule->jamFotografer,
            'jamEditor' => $schedule->jamEditor,
        ];

        return Inertia::render('Admin/Schedule/EditSchedule', [
            'schedule' => $scheduleData,
            'fotografers' => Fotografer::all(),
            'editors' => Editor::all(),
            'lapangans' => Lapangan::all(),
        ]);
    }

    public function update(Request $request, Schedule $schedule)
    {
        $validated = $this->validateSchedule($request, true);

        $schedule->update($this->prepareScheduleData($validated, $schedule));

        return redirect()->route('schedule.index')->with('success', 'Schedule berhasil diupdate.');
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
            'fotografer_id' => 'nullable|exists:fotografers,id',
            'editor_id' => 'nullable|exists:editors,id',
            'lapangan_id' => 'required|exists:lapangans,id',
            'catatan' => 'nullable|string',
            'linkGdrive' => 'nullable|url',
        ]);
    }

    private function prepareScheduleData(array $validated, ?Schedule $schedule = null): array
    {
        $durasiJam = 0;
        $jamEditor = 0;

        if (!empty($validated['jamMulai']) && !empty($validated['jamSelesai'])) {
            $durasiJam = $this->calculateDuration($validated['jamMulai'], $validated['jamSelesai']);
        }

        if (!empty($validated['editor_id'])) {
            $jamEditor = 1;
        }

        return [
            'tanggal' => $validated['tanggal'],
            'jamMulai' => $validated['jamMulai'],
            'jamSelesai' => $validated['jamSelesai'],
            'namaEvent' => $validated['namaEvent'],
            'fotografer_id' => $validated['fotografer_id'] ?: null,
            'editor_id' => $validated['editor_id'] ?: null,
            'lapangan_id' => $validated['lapangan_id'],
            'catatan' => $validated['catatan'],
            'linkGdrive' => $validated['linkGdrive'],
            'jamFotografer' => $durasiJam,
            'jamEditor' => $jamEditor,
        ];
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

        if ($tanggal instanceof \Carbon\Carbon) {
            $tanggal = $tanggal->format('Y-m-d');
        }

        $tanggal = trim($tanggal);
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $tanggal)) {
            return 'pending';
        }

        $parseDateTimeOrTime = function (string $input, string $baseDate) {
            $input = trim($input);

            // case: "YYYY-MM-DD HH:MM" or "YYYY-MM-DD HH:MM:SS"
            if (preg_match('/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}(:\d{2})?)/', $input, $m)) {
                $datePart = $m[1];
                $timePart = $m[2];
                if (strlen($timePart) === 5)
                    $timePart .= ':00';
                $useDate = ($datePart === $baseDate) ? $datePart : $baseDate;
                return \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', "$useDate $timePart", 'Asia/Jakarta');
            }

            // case: "YYYY-MM-DDTHH:MM" (ISO)
            if (preg_match('/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}(:\d{2})?)/', $input, $m)) {
                $datePart = $m[1];
                $timePart = $m[2];
                if (strlen($timePart) === 5)
                    $timePart .= ':00';
                $useDate = ($datePart === $baseDate) ? $datePart : $baseDate;
                return \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', "$useDate $timePart", 'Asia/Jakarta');
            }

            // case: time only "HH:MM" or "HH:MM:SS"
            if (preg_match('/\d{2}:\d{2}(:\d{2})?/', $input, $m)) {
                $time = $m[0];
                if (strlen($time) === 5)
                    $time .= ':00';
                return \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', "$baseDate $time", 'Asia/Jakarta');
            }

            return null;
        };

        $scheduleStart = $parseDateTimeOrTime($jamMulai, $tanggal);
        $scheduleEnd = $parseDateTimeOrTime($jamSelesai, $tanggal);

        if (!$scheduleStart || !$scheduleEnd) {
            return 'pending';
        }

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
