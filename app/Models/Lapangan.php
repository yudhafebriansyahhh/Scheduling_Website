<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lapangan extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_lapangan'
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
