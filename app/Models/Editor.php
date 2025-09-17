<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Editor extends Model
{
    use HasFactory;

    protected $table = 'editor';

    protected $fillable = ['nama', 'alamat', 'no_hp', 'email', 'photo'];

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}

