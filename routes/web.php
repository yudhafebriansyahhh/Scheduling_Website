<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\EditorController;
use App\Http\Controllers\FotograferController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect root ke login jika belum login, atau ke admin dashboard jika sudah login
Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();
        if ($user->role == 'admin') {
            return redirect()->route('admin');
        }
        // Jika bukan admin, logout otomatis karena web hanya untuk admin
        Auth::logout();
        return redirect()->route('login')->with('message', 'Akses web hanya untuk admin');
    }

    return redirect()->route('login');
});

// web.php
Route::resource('admin', AdminController::class);
Route::resource('fotografer', FotograferController::class);
Route::resource('editor', EditorController::class);
Route::resource('schedule', ScheduleController::class);

// Route untuk mendapatkan jadwal berdasarkan tanggal (AJAX)
Route::get('/admin/schedules-by-date', [AdminController::class, 'getSchedulesByDate'])->name('admin.schedules.by-date');



Route::get('/admin', [AdminController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('admin');


// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

require __DIR__.'/auth.php';
