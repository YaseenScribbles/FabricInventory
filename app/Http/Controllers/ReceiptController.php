<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Http\Requests\StoreReceiptRequest;
use App\Http\Requests\UpdateReceiptRequest;
use App\Http\Resources\ReceiptResource;
use App\Models\ReceiptItem;
use App\Models\Store;
use App\Models\User;
use App\Models\UserStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReceiptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->has('all') && $request->all == 'true') {
            $receipts = Receipt::with('receipt_items')->get();
        } else {
            // $receipts = Receipt::with('receipt_items')->paginate(10);
            $userId = $request->userId;
            $user = User::find($userId);

            if ($user->role === 'admin') {
                $store_ids = Store::where('active', true)->pluck('id');
            } else {
                $user_store_ids = UserStore::where('user_id', $userId)->pluck('store_id');
                $store_ids = Store::where('active', 1)->whereIn('id', $user_store_ids)->pluck('id');
            }

            $receipts = Receipt::join('receipt_items', 'receipt_items.receipt_id', '=', 'receipts.id')
                ->join('fabrics', 'fabrics.id', '=', 'receipts.fabric_id')
                ->join('users', 'users.id', '=', 'receipts.user_id')
                ->join('stores', 'stores.id', '=', 'receipts.store_id')
                ->select(
                    'receipts.id',
                    'receipts.created_at',
                    'receipts.lot_no',
                    'receipts.brand',
                    'receipts.contact_id',
                    DB::raw("'Demo' as [contact]"),
                    'receipts.fabric_id',
                    DB::raw('fabrics.name as fabric'),
                    'receipts.remarks',
                    DB::raw('users.name as [user]'),
                    DB::raw('sum(receipt_items.rolls) as rolls'),
                    DB::raw('sum(receipt_items.weight) as weight')
                )
                ->whereIn('receipts.store_id', $store_ids)
                ->where('receipts.store_id',$request->storeId)
                ->groupBy('receipts.id', 'receipts.created_at', 'receipts.lot_no', 'receipts.brand', 'receipts.contact_id', 'receipts.fabric_id', 'fabrics.name', 'receipts.remarks', 'users.name')
                ->paginate(10);
        }

        return ReceiptResource::collection($receipts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreReceiptRequest $request)
    {
        $request->validated();
        try {
            DB::beginTransaction();
            $details = $request->receipt_items;
            $masters = $request->except('receipt_items');

            $master = Receipt::create($masters);

            foreach ($details as $key => $detail) {
                ReceiptItem::create([
                    'receipt_id' => $master->id,
                    'color_id' => $detail['color_id'],
                    'dia' => $detail['dia'],
                    'rolls' => $detail['rolls'],
                    'weight' => $detail['weight'],
                    's_no' => $key + 1
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Receipt created', 'id' => $master->id]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Receipt $receipt)
    {
        $receipt->load('receipt_items');

        return response()->json($receipt);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateReceiptRequest $request, Receipt $receipt)
    {
        $request->validated();
        try {
            $details = $request->receipt_items;
            $master = $request->except('receipt_items');
            $receipt->update($master);

            ReceiptItem::where('receipt_id', $receipt->id)->delete();

            foreach ($details as $key => $detail) {
                ReceiptItem::create([
                    'receipt_id' => $receipt->id,
                    'color_id' => $detail['color_id'],
                    'dia' => $detail['dia'],
                    'rolls' => $detail['rolls'],
                    'weight' => $detail['weight'],
                    's_no' => $key + 1
                ]);
            }
            return response()->json(['message' => 'Receipt updated', 'id' => $receipt->id]);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Receipt $receipt)
    {
        try {
            ReceiptItem::where('receipt_id', $receipt->id)->delete();
            Receipt::find($receipt->id)->delete();
            return response()->json(['message' => 'Receipt deleted'], 200);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    public function report(Receipt $receipt)
    {

        try {

            $masterSql  = "select r.id, r.created_at date, c.name company_name, c.address company_address, r.lot_no, r.brand, s.name store, 'demo' contact, f.name fabric,r.remarks, u.name [user]
            from receipts r
            inner join fabrics f on r.fabric_id = f.id
            inner join stores s on s.id = r.store_id
            inner join users u on r.user_id = u.id
            inner join companies c on c.id = r.company_id
            where r.id = $receipt->id";

            $detailsSql = "select c.name color,dia,rolls,weight
            from receipt_items ri
            inner join colors c on c.id = ri.color_id
            where receipt_id = $receipt->id";

            $master = DB::select($masterSql);
            $details = DB::select($detailsSql);

            return response()->json(['master' => $master[0], 'details' => $details]);
        } catch (\Throwable $th) {

            return response()->json(['message' => $th->getMessage()], 500);
        }
    }
}
