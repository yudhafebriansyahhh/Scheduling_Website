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

}
