<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{

    public function index(Request $request)
    {
        try {
            //code...
            $suppliersQuery = DB::table('suppliers')
                ->select('id', 'name');

            if ($request->has('query') && $request->query('query') !== "") {
                $suppliersQuery->where('name', 'like', '%' . $request->query('query') . '%');
            }

            $suppliers = $suppliersQuery->get();

            return response()->json(['suppliers' => $suppliers]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }
}
