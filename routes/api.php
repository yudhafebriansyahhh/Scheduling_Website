<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ScheduleAssistController;

Route::get('/', function(){
    return'API';
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('schedule',ScheduleController::class);
    // Route::apiResource('profil', ProfileController::class);
    Route::get('profil', [ProfileController::class,'index']);
    Route::post('profil/{id}', [ProfileController::class, 'update']);
    Route::apiResource('assist', ScheduleAssistController::class);


});
// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
