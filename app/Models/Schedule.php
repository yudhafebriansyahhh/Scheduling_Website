<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Schedule extends Model
{
    use HasFactory;

    protected $table = 'schedules';

    protected $fillable = [
        'tanggal',
        'jam_mulai',
        'jam_selesai',
        'nama_event',
        'id_fotografer',
        'id_editor',
        'lapangan',
        'status',

    ];

    public $timestamps = false;

    public function fotografer()
    {
        return $this->belongsTo(User::class, 'id_fotografer');
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'id_editor');
    }
}
