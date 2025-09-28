<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Assist;
use App\Models\Fotografer;
use App\Models\Editor;
use Carbon\Carbon;

class AssistController extends Controller
{
    public function index()
    {
        $assists = Assist::with('assistable')->get();

        $fotografers = Fotografer::select('id', 'nama')->get()->map(fn($item) => [
            'id' => 'fotografer|' . $item->id,
            'nama' => $item->nama,
            'type' => 'fotografer'
        ]);

        $editors = Editor::select('id', 'nama')->get()->map(fn($item) => [
            'id' => 'editor|' . $item->id,
            'nama' => $item->nama,
            'type' => 'editor'
        ]);

        $assistsOptions = $fotografers->merge($editors);

        return inertia('Admin/KelolaAssist', [
            'assists' => $assists,
            'assistsOptions' => $assistsOptions
        ]);
    }

    public function getAssistData()
    {
        return Assist::with('assistable')->get()->map(function ($assist) {
            $assist->status = $this->determineStatus($assist->tanggal, $assist->jamMulai, $assist->jamSelesai);
            $assist->nama = $assist->assistable->nama;
            return $assist;
        });
    }

    public function getSessionCount($assists)
    {
        $sessionCounts = [];
        foreach ($assists as $assist) {
            $key = $assist->assistable_type . '_' . $assist->assistable_id;
            if (!isset($sessionCounts[$key])) {
                $sessionCounts[$key] = [
                    'nama' => $assist->assistable->nama,
                    'type' => str_contains($assist->assistable_type, 'Fotografer') ? 'fotografer' : 'editor',
                    'jumlah_sesi' => 0
                ];
            }
            $sessionCounts[$key]['jumlah_sesi']++;
        }
        return array_values($sessionCounts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'person_id' => 'required|string',
            'tanggal' => 'required|date',
            'jamMulai' => 'required|string',
            'jamSelesai' => 'required|string',
        ]);

        [$type, $id] = explode('|', $request->person_id);
        $assistableType = $type === 'fotografer' ? Fotografer::class : Editor::class;

        Assist::create([
            'assistable_type' => $assistableType,
            'assistable_id' => $id,
            'tanggal' => $request->tanggal,
            'jamMulai' => $request->jamMulai,
            'jamSelesai' => $request->jamSelesai
        ]);

        return redirect()->back()->with('success', 'Jadwal assist berhasil ditambahkan!');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'person_id' => 'required|string',
            'tanggal' => 'required|date',
            'jamMulai' => 'required|string',
            'jamSelesai' => 'required|string',
        ]);

        $assist = Assist::findOrFail($id);

        [$type, $assistableId] = explode('|', $request->person_id);
        $assistableType = $type === 'fotografer' ? Fotografer::class : Editor::class;

        $assist->update([
            'assistable_type' => $assistableType,
            'assistable_id' => $assistableId,
            'tanggal' => $request->tanggal,
            'jamMulai' => $request->jamMulai,
            'jamSelesai' => $request->jamSelesai,
        ]);

        return redirect()->back()->with('success', 'Data assist berhasil diupdate!');
    }

    public function destroy($id)
    {
        Assist::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Jadwal assist berhasil dihapus!');
    }

    private function determineStatus($tanggal, string $jamMulai, string $jamSelesai): string
    {
        $now = now('Asia/Jakarta');

        if ($tanggal instanceof Carbon) {
            $tanggal = $tanggal->format('Y-m-d');
        }

        $scheduleStart = Carbon::createFromFormat('Y-m-d H:i:s', "{$tanggal} {$jamMulai}:00", 'Asia/Jakarta');
        $scheduleEnd = Carbon::createFromFormat('Y-m-d H:i:s', "{$tanggal} {$jamSelesai}:00", 'Asia/Jakarta');

        if ($scheduleEnd->lte($scheduleStart)) {
            $scheduleEnd->addDay();
        }

        return match (true) {
            $now->lt($scheduleStart) => 'pending',
            $now->between($scheduleStart, $scheduleEnd) => 'in_progress',
            default => 'completed',
        };
    }
}
