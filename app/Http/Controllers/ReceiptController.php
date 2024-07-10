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
            $is_closed = $request->isClosed == 'true' ? '1' : '0';

            if ($user->role === 'admin') {
                $store_ids = Store::where('active', true)->pluck('id');
            } else {
                $user_store_ids = UserStore::where('user_id', $userId)->pluck('store_id');
                $store_ids = Store::where('active', 1)->whereIn('id', $user_store_ids)->pluck('id');
            }

            $receipts =  DB::table(DB::raw("(
                SELECT r.id, r.created_at, r.lot_no, r.brand, r.cloth, r.contact_id, su.name as contact,
                r.fabric_id, f.name as fabric, r.remarks, u.name as [user],
                SUM(ri.rolls) as rolls, SUM(ri.weight) as weight, r.is_locked
                FROM receipts r
                INNER JOIN receipt_items ri ON ri.receipt_id = r.id
                AND r.is_closed = $is_closed AND r.store_id = $request->storeId
                INNER JOIN fabrics f ON f.id = r.fabric_id
                INNER JOIN users u ON u.id = r.user_id
                INNER JOIN suppliers su on su.id = r.contact_id
                GROUP BY r.id, r.created_at, r.lot_no, r.brand, r.contact_id,
                r.fabric_id, f.name, r.remarks, u.name, r.is_locked,su.name,r.cloth
            ) as receipt"))
            ->leftJoin(DB::raw('(
                SELECT d.receipt_id, SUM(di.rolls) as rolls, SUM(di.weight) as weight
                FROM deliveries d
                INNER JOIN delivery_items di ON d.id = di.delivery_id
                GROUP BY d.receipt_id
            ) as d'), 'd.receipt_id', '=', 'receipt.id')
            ->leftJoin(DB::raw('(
                SELECT id, SUM(rolls) as stock_rolls, SUM(weight) as stock_weight
                FROM stock
                GROUP BY id
            ) as s'), 's.id', '=', 'receipt.id')
            ->select(
                'receipt.*',
                DB::raw('COALESCE(d.rolls, 0) as delivered_rolls'),
                DB::raw('COALESCE(d.weight, 0) as delivered_weight'),
                's.stock_rolls',
                's.stock_weight'
            )
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
            DB::beginTransaction();
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
            DB::commit();
            return response()->json(['message' => 'Receipt updated', 'id' => $receipt->id]);
        } catch (\Throwable $th) {
            DB::rollBack();
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

            $masterSql  = "select r.id, r.created_at date, c.name company_name, c.address company_address, r.lot_no, r.brand, r.cloth, s.name store, su.name contact, f.name fabric,r.remarks, u.name [user]
            from receipts r
            inner join fabrics f on r.fabric_id = f.id
            inner join stores s on s.id = r.store_id
            inner join users u on r.user_id = u.id
            inner join companies c on c.id = r.company_id
            inner join suppliers su on su.id = r.contact_id
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

    public function deliverableReceipts(Request $request)
    {
        $user_id = $request->userId;
        $store_ids = UserStore::where('user_id', $user_id)->pluck('store_id');

        $user = User::find($user_id);

        if ($user->role === 'admin') {

            $receipt_ids = Receipt::where('is_closed', false)
                ->select('receipts.id')
                ->get();
        } else {

            $receipt_ids = Receipt::where('is_closed', false)
                ->whereIn('store_id', $store_ids)
                ->select('receipts.id')
                ->get();
        }

        return response()->json(['receiptIds' => $receipt_ids]);
    }

    public function updateCloseStatus(int $id) {
        $receipt = Receipt::find($id);
        $receipt->update([
            'is_closed' => !($receipt->is_closed)
        ]);
        return response()->json(['message' => 'status updated']);
    }

}
