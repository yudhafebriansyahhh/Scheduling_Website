<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduleFotograferAssist extends Model
{
    use HasFactory;

    protected $table = 'schedule_fotografer_assist';

    protected $fillable = [
        'schedule_id',
        'fotografer_id',
        'jamAssist'
    ];

    protected $casts = [
        'jamAssist' => 'decimal:1'
    ];

    /**
     * Relasi ke Schedule
     */
    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * Relasi ke Fotografer
     */
    public function fotografer()
    {
        return $this->belongsTo(Fotografer::class);
    }
}
