<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BrandController extends Controller
{
    public function index (Request $request)
    {
        try {
            //code...
            $brandsQuery = DB::table('brands')
                ->select('brand');

            if ($request->has('query') && $request->query('query') !== "") {
                $brandsQuery->where('brand', 'like', '%' . $request->query('query') . '%');
            }

            $brands = $brandsQuery->get();

            return response()->json(['brands' => $brands]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    public function brandUpdate(int $id, Request $request)
    {
        try {
            //code...
            $receipt =  Receipt::find($id);
            $receipt->update([
                'brand' => $request->brand
            ]);
            return response()->json(['message' => 'brand updated']);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json(['message' => $th->getMessage()], 500);
        }

    }
}
