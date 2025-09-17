<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
        'lapangan',
        'status',
        'totalJam',
        'jamFotografer',
        'jamEditor',
        'catatan',
        'linkGdriveFotografer',
        'linkGdriveEditor',
    ];

    public function fotografer()
    {
        return $this->belongsTo(Fotografer::class);
    }

    public function editor()
    {
        return $this->belongsTo(Editor::class);
    }
}
