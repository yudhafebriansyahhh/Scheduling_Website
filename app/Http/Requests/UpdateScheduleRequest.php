<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tanggal'       => ['required', 'date'],
            'jam_mulai'     => ['required', 'date_format:H:i'],
            'jam_selesai'   => ['required', 'date_format:H:i', 'after:jam_mulai'],
            'nama_event'    => ['required', 'string', 'max:150'],
            'id_fotografer' => ['required', 'exists:users,id'],
            'id_editor'     => ['nullable', 'exists:users,id'],
            'lapangan'      => ['required', 'string', 'max:50'],
            'status'        => ['required', 'in:pending,confirmed,cancelled'],
        ];
    }
}
