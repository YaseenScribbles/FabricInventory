<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Color;
use App\Models\Fabric;
use App\Models\Store;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Admin',
        //     'email' => 'admin@essa.com',
        //     'password' => 'password',
        //     'role' => 'admin'
        // ]);

        // Fabric::create([
        //     'name' => 'FINE',
        //     'user_id' => 1
        // ]);

        // Fabric::create([
        //     'name' => 'RIB',
        //     'user_id' => 1
        // ]);

        // Color::factory(50)->create();

        Store::factory(50)->create();
    }
}
