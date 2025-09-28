<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Assist extends Model
{
    use HasFactory;

    protected $fillable = [
        'assistable_id',
        'assistable_type',
        'tanggal',
        'jamMulai',
        'jamSelesai',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jamMulai' => 'datetime:H:i',
        'jamSelesai' => 'datetime:H:i',
    ];

    /**
     * Get the parent assistable model (Fotografer or Editor).
     */
    public function assistable()
    {
        return $this->morphTo();
    }

    /**
     * Scope untuk filter berdasarkan tanggal
     */
    public function scopeByDate($query, $date)
    {
        return $query->where('tanggal', $date);
    }

    /**
     * Scope untuk filter berdasarkan bulan dan tahun
     */
    public function scopeByMonth($query, $year, $month)
    {
        return $query->whereYear('tanggal', $year)
                    ->whereMonth('tanggal', $month);
    }

    /**
     * Scope untuk filter jadwal hari ini
     */
    public function scopeToday($query)
    {
        return $query->where('tanggal', Carbon::today());
    }

    /**
     * Scope untuk filter jadwal mendatang
     */
    public function scopeUpcoming($query)
    {
        return $query->where('tanggal', '>=', Carbon::today());
    }

    /**
     * Accessor untuk mendapatkan durasi dalam menit
     */
    public function getDurationInMinutesAttribute()
    {
        $start = Carbon::createFromFormat('H:i', $this->jamMulai);
        $end = Carbon::createFromFormat('H:i', $this->jamSelesai);

        return $end->diffInMinutes($start);
    }

    /**
     * Accessor untuk mendapatkan durasi dalam format string
     */
    public function getDurationFormattedAttribute()
    {
        $minutes = $this->duration_in_minutes;
        $hours = floor($minutes / 60);
        $mins = $minutes % 60;

        if ($hours > 0) {
            return $hours . ' jam' . ($mins > 0 ? ' ' . $mins . ' menit' : '');
        }

        return $mins . ' menit';
    }

    /**
     * Helper untuk mendapatkan tanggal yang clean
     */
    private function getCleanDate()
    {
        // Jika tanggal adalah string, bersihkan dari kemungkinan double date
        if (is_string($this->tanggal)) {
            // Ambil hanya 10 karakter pertama (Y-m-d format)
            return substr(trim($this->tanggal), 0, 10);
        }

        // Jika Carbon instance, format ke Y-m-d
        if ($this->tanggal instanceof Carbon) {
            return $this->tanggal->format('Y-m-d');
        }

        // Fallback: coba parse dan format
        try {
            return Carbon::parse($this->tanggal)->format('Y-m-d');
        } catch (\Exception $e) {
            // Jika gagal, return hari ini
            return now()->format('Y-m-d');
        }
    }

    /**
     * Helper untuk mendapatkan jam yang clean
     */
    private function getCleanTime($time)
    {
        // Ambil hanya 5 karakter pertama (HH:MM format)
        return substr(trim($time), 0, 5);
    }

    /**
     * Check apakah jadwal ini sudah lewat
     */
    public function getIsPastAttribute()
    {
        try {
            $dateOnly = $this->getCleanDate();
            $timeOnly = $this->getCleanTime($this->jamSelesai);

            $scheduleDateTime = Carbon::createFromFormat('Y-m-d H:i', $dateOnly . ' ' . $timeOnly);
            return $scheduleDateTime->isPast();
        } catch (\Exception $e) {
            \Log::error("Error in getIsPastAttribute: " . $e->getMessage(), [
                'tanggal' => $this->tanggal,
                'jamSelesai' => $this->jamSelesai
            ]);
            return false;
        }
    }

    /**
     * Check apakah jadwal ini sedang berlangsung
     */
    public function getIsActiveAttribute()
    {
        try {
            $now = Carbon::now();

            $dateOnly = $this->getCleanDate();
            $startTime = $this->getCleanTime($this->jamMulai);
            $endTime = $this->getCleanTime($this->jamSelesai);

            $startDateTime = Carbon::createFromFormat('Y-m-d H:i', $dateOnly . ' ' . $startTime);
            $endDateTime = Carbon::createFromFormat('Y-m-d H:i', $dateOnly . ' ' . $endTime);

            return $now->between($startDateTime, $endDateTime);
        } catch (\Exception $e) {
            \Log::error("Error in getIsActiveAttribute: " . $e->getMessage(), [
                'tanggal' => $this->tanggal,
                'jamMulai' => $this->jamMulai,
                'jamSelesai' => $this->jamSelesai
            ]);
            return false;
        }
    }

    /**
     * Get status jadwal (pending, in_progress, completed)
     */
    public function getStatusAttribute()
    {
        try {
            $now = Carbon::now();

            $dateOnly = $this->getCleanDate();
            $startTime = $this->getCleanTime($this->jamMulai);
            $endTime = $this->getCleanTime($this->jamSelesai);

            $startDateTime = Carbon::createFromFormat('Y-m-d H:i', $dateOnly . ' ' . $startTime);
            $endDateTime = Carbon::createFromFormat('Y-m-d H:i', $dateOnly . ' ' . $endTime);

            // Handle case where end time is next day
            if ($endDateTime->lte($startDateTime)) {
                $endDateTime->addDay();
            }

            if ($now->lt($startDateTime)) {
                return 'pending';
            } elseif ($now->between($startDateTime, $endDateTime)) {
                return 'in_progress';
            } else {
                return 'completed';
            }
        } catch (\Exception $e) {
            \Log::error("Error in getStatusAttribute: " . $e->getMessage(), [
                'tanggal' => $this->tanggal,
                'jamMulai' => $this->jamMulai,
                'jamSelesai' => $this->jamSelesai
            ]);
            return 'pending';
        }
    }

    /**
     * Get status jadwal (upcoming, active, completed)
     */
    // public function getStatusAttribute()
    // {
    //     if ($this->is_active) {
    //         return 'active';
    //     } elseif ($this->is_past) {
    //         return 'completed';
    //     } else {
    //         return 'upcoming';
    //     }
    // }
}
