<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Carbon\Carbon;

class ValidTimeRange implements ValidationRule
{
    protected $startTime;

    public function __construct($startTime)
    {
        $this->startTime = $startTime;
    }

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        try {
            // Cek apakah startTime ada
            if (!$this->startTime) {
                return; // Skip validation jika jam mulai belum diisi
            }

            $start = Carbon::createFromFormat('H:i', $this->startTime);
            $end = Carbon::createFromFormat('H:i', $value);

            // Debug info
            \Log::info('Time validation debug:', [
                'start_time' => $this->startTime,
                'end_time' => $value,
                'start_carbon' => $start->format('H:i'),
                'end_carbon' => $end->format('H:i'),
                'end_greater' => $end->gt($start)
            ]);

            // Hitung durasi
            $durasiMenit = 0;

            if ($end->gt($start)) {
                // Kasus normal: jam selesai > jam mulai (21:00 - 23:00)
                $durasiMenit = $end->diffInMinutes($start);
            } else {
                // Kasus melewati hari: jam selesai <= jam mulai (23:00 - 01:00)
                $endNextDay = $end->copy()->addDay();
                $durasiMenit = $endNextDay->diffInMinutes($start);
            }

            \Log::info('Durasi calculated:', [
                'durasi_menit' => $durasiMenit,
                'durasi_jam' => round($durasiMenit / 60, 2)
            ]);

            // Minimal 15 menit, maksimal 24 jam (1440 menit)
            if ($durasiMenit < 15) {
                $fail('Durasi event minimal 15 menit.');
            }

            if ($durasiMenit > 1440) {
                $fail('Durasi event maksimal 24 jam.');
            }

        } catch (\Exception $e) {
            \Log::error('Time validation error:', ['error' => $e->getMessage()]);
            $fail('Format waktu tidak valid: ' . $e->getMessage());
        }
    }
}
