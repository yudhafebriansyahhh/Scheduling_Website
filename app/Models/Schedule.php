<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'tanggal',
        'jamMulai',
        'jamSelesai',
        'namaEvent',
        'fotografer_id',
        'editor_id',
        'lapangan_id',
        'jamFotografer',
        'jamEditor',
        'catatan',
        'linkGdrive',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jamMulai' => 'string',
        'jamSelesai' => 'string',
        'jamFotografer' => 'decimal:1',
        'jamEditor' => 'decimal:1'
    ];

    public function fotografer()
    {
        return $this->belongsTo(Fotografer::class);
    }

    public function editor()
    {
        return $this->belongsTo(Editor::class);
    }

    public function lapangan()
    {
        return $this->belongsTo(Lapangan::class);
    }

    /**
     * Accessor untuk format tanggal yang readable untuk display
     */
    public function getFormattedTanggalAttribute()
    {
        return $this->tanggal->format('d M Y');
    }

    /**
     * Accessor untuk format jam yang readable untuk display
     */
    public function getFormattedJamAttribute()
    {
        return $this->jamMulai . ' - ' . $this->jamSelesai;
    }
}
