<?php

namespace App\Http\Controllers;

use App\Models\Fabric;
use App\Http\Requests\StoreFabricRequest;
use App\Http\Requests\UpdateFabricRequest;
use App\Http\Resources\FabricResource;

class FabricController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $fabrics = Fabric::with('user')->paginate(10);
        return FabricResource::collection($fabrics);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFabricRequest $request)
    {
        $data = $request->validated();
        try {
            Fabric::create($data);
            return response()->json(['message' => 'Fabric created']);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Fabric $fabric)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFabricRequest $request, Fabric $fabric)
    {
        $data = $request->validated();
        try {
            $fabric->update($data);
            return response()->json(['message' =>  'Fabric updated']);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Fabric $fabric)
    {
        try {
            $message = $fabric->active ? 'suspended' :  'activated';
            $fabric->update(['active' => !$fabric->active]);
            return response()->json(['message' => 'Fabric ' . $message]);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }
}
