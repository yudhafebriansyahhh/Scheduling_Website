<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function index()
{
    return inertia('Admin/dashboard', [
        'stats' => [
            'jadwal_bulan_ini' => 12,
            'total_fotografer' => 6,
            'total_editor' => 3,
        ]
    ]);
}
}
