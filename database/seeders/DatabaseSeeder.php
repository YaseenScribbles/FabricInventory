<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Color;
use App\Models\Fabric;
use App\Models\Store;
use App\Models\UserStore;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Admin',
        //     'email' => 'admin@essa.com',
        //     'password' => 'essa@7777',
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

        Color::factory(60)->create();

        Store::factory(50)->create();

        UserStore::factory(25)->create();
    }
}
