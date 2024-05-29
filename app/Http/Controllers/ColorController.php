<?php

namespace App\Http\Controllers;

use App\Models\Color;
use App\Http\Requests\StoreColorRequest;
use App\Http\Requests\UpdateColorRequest;
use App\Http\Resources\ColorResource;
use Illuminate\Http\Request;

class ColorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if($request->has('all') &&  $request->all == 'true'){
            return ColorResource::collection(Color::where('active',1)->get());
        }
        $colors = Color::with('user')->paginate(10);
        return ColorResource::collection($colors);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreColorRequest $request)
    {
        $data = $request->validated();
        try {
            Color::create($data);
            return response()->json(['message' => 'Color created']);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Color $color)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateColorRequest $request, Color $color)
    {
        $data = $request->validated();
        try {
            $color->update($data);
            return response()->json(['message' =>  'Color updated']);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Color $color)
    {
        try {
            $message = $color->active ? 'suspended' :  'activated';
            $color->update(['active' => !$color->active]);
            return response()->json(['message' => 'Color ' . $message]);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }
}
