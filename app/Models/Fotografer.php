<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fotografer extends Model
{
    use HasFactory;

    protected $table = 'fotografer';

    protected $fillable = ['nama', 'alamat', 'no_hp', 'email', 'photo'];

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
