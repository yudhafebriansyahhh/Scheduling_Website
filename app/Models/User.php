<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable,HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // Jika ada kolom role
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relasi ke Editor (One-to-One)
    public function editor()
    {
        return $this->hasOne(Editor::class);
    }

    // Relasi ke Fotografer jika ada
    public function fotografer()
    {
        return $this->hasOne(Fotografer::class);
    }

    // Method untuk check role
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isEditor()
    {
        return $this->role === 'editor';
    }

    public function isFotografer()
    {
        return $this->role === 'fotografer';
    }
}
