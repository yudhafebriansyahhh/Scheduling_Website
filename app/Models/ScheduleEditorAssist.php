<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduleEditorAssist extends Model
{
    use HasFactory;

    protected $table = 'schedule_editor_assists';

    protected $fillable = [
        'schedule_id',
        'editor_id',
        'jamAssist'
    ];

    protected $casts = [
        'jamAssist' => 'decimal:1'
    ];

    // Relasi ke Schedule
    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    // Relasi ke Editor
    public function editor()
    {
        return $this->belongsTo(Editor::class);
    }
}
