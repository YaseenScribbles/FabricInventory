<?php

namespace App\Http\Controllers;

use App\Http\Resources\StockResource;
use App\Models\Receipt;
use App\Models\Stock;
use App\Models\Store;
use App\Models\User;
use App\Models\UserStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{

    public function lotsAndBrands(User $user)
    {
        try {
            //code...
            if ($user->role === 'user') {
                $store_ids = UserStore::where('user_id', $user->id)->pluck('store_id');
            } else {
                $store_ids = Store::where('active', true)->pluck('id');
            }
            $lotsAndBrands = Receipt::whereIn('store_id', $store_ids)
                ->select('lot_no', 'brand')
                ->distinct()
                ->get();

            return response()->json(['lotsAndBrands' => $lotsAndBrands]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    public function stock(Request $request)
    {
        try {
            //code...

            $userId = $request->userId;
            $user = User::find($userId);

            if ($user->role === 'admin') {
                $store_ids = Store::where('active', true)->pluck('id');
            } else {
                $store_ids = UserStore::where('user_id', $userId)->pluck('store_id');
            }
            $stockQuery = Stock::join('receipts as r', 'r.id', '=', 'stock.id')
                ->join('companies as c', 'c.id', '=', 'r.company_id')
                ->join('stores as st', 'st.id', '=', 'r.store_id')
                ->join('fabrics as f', 'f.id', '=', 'r.fabric_id')
                ->select(
                    'r.id',
                    'r.lot_no',
                    'r.brand',
                    'c.name as company',
                    'st.name as store',
                    'f.name as fabric',
                    DB::raw("'Demo' as contact"),
                    DB::raw('SUM(stock.rolls) as rolls'),
                    DB::raw('SUM(stock.weight) as weight'),
                    DB::raw('DATEDIFF(day,r.created_at,GETDATE()) as days'),
                )
                ->whereIn('r.store_id', $store_ids)
                ->groupBy('r.id', 'r.lot_no', 'r.brand', 'c.name', 'st.name', 'f.name', 'r.created_at');

            if ($request->has('lot_no') && isset($request->lot_no)) {
                $stockQuery->where('r.lot_no', $request->lot_no);
            }

            if ($request->has('brand') && isset($request->brand)) {
                $stockQuery->where('r.brand', $request->brand);
            }

            if ($request->has('store_id') && isset($request->store_id)) {
                $stockQuery->where('st.id', $request->store_id);
            }

            if ($request->has('fabric_id') && isset($request->fabric_id)) {
                $stockQuery->where('f.id', $request->fabric_id);
            }

            if ($request->has('is_closed')) {
                $stockQuery->where('r.is_closed', $request->is_closed == 'true' ? true : false);
            }

            if ($request->has('all') && $request->all == 'true') {
                $stock = $stockQuery->get();
            } else {
                $stock = $stockQuery->paginate(10);
            }

            return StockResource::collection($stock);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json(['message' => $th->getMessage()]);
        }
    }

    public function stockReport(Receipt $receipt)
    {
        try {
            //code...
            $masterSql  = "select r.id, r.created_at date, c.name company_name, c.address company_address, r.lot_no, r.brand, s.name store, 'demo' contact, f.name fabric,r.remarks, datediff(day,r.created_at,getdate()) days,r.is_closed as status
            from receipts r
            inner join fabrics f on r.fabric_id = f.id
            inner join stores s on s.id = r.store_id
            inner join users u on r.user_id = u.id
            inner join companies c on c.id = r.company_id
            where r.id = $receipt->id";

            $detailsSql = "select c.name color,s.dia,s.rolls,s.weight
            from stock s
            inner join colors c on c.id = s.color_id
            where s.id= $receipt->id order by s.s_no";

            $master = DB::select($masterSql);
            $details = DB::select($detailsSql);

            return response()->json(['master' => $master[0], 'details' => $details]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }
}
