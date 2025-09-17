<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
     public function index()
    {
        $schedules = Schedule::with(['fotografer', 'editor'])->get();

        return Inertia::render('Admin/Laporan', [
            'schedules' => $schedules
        ]);
    }
}
