<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Assist;
use App\Models\Fotografer;
use App\Models\Editor;
use Carbon\Carbon;

class ScheduleAssistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        // Ambil data sesuai role
        if ($user->role === 'admin') {
            $assists = Assist::with('assistable')->get();
        } elseif ($user->role === 'fotografer') {
            $fotografer = Fotografer::where('user_id', $user->id)->first();
            $assists = Assist::where('assistable_type', Fotografer::class)
                ->where('assistable_id', $fotografer?->id)
                ->with('assistable')
                ->get();
        } elseif ($user->role === 'editor') {
            $editor = Editor::where('user_id', $user->id)->first();
            $assists = Assist::where('assistable_type', Editor::class)
                ->where('assistable_id', $editor?->id)
                ->with('assistable')
                ->get();
        } else {
            $assists = collect([]);
        }

        // Format data tanggal dan jam
        $formatted = $assists->map(function ($assist) {
            return [
                'id' => $assist->id,
                'tanggal' => $assist->tanggal ? Carbon::parse($assist->tanggal)->format('Y-m-d') : null,
                'jamMulai' => $assist->jamMulai ? Carbon::parse($assist->jamMulai)->format('H:i') : null,
                'jamSelesai' => $assist->jamSelesai ? Carbon::parse($assist->jamSelesai)->format('H:i') : null,
                'assistable_type' => class_basename($assist->assistable_type),
                'assistable' => $assist->assistable,
            ];
        });

        return response()->json([
            'message' => 'Data assist berhasil diambil',
            'data' => $formatted
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
       
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
       
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
       
    }
}
