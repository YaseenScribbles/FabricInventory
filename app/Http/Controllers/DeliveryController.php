<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Http\Requests\StoreDeliveryRequest;
use App\Http\Requests\UpdateDeliveryRequest;
use App\Http\Resources\DeliveryResource;
use App\Models\DeliveryItem;
use App\Models\Receipt;
use App\Models\Stock;
use App\Models\Store;
use App\Models\User;
use App\Models\UserStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->has('all') && $request->all == 'true') {
            return Delivery::with('delivery_items')->get();
        } else {
            $userId = $request->userId;
            $user = User::find($userId);

            if ($user->role === 'admin') {
                $store_ids = Store::where('active', true)->pluck('id');
            } else {
                $user_store_ids = UserStore::where('user_id', $userId)->pluck('store_id');
                $store_ids = Store::where('active', 1)->whereIn('id', $user_store_ids)->pluck('id');
            }

            $deliveries = Delivery::join('delivery_items', 'delivery_items.delivery_id', '=', 'deliveries.id')
                ->join('receipts', 'receipts.id', '=', 'deliveries.receipt_id')
                ->join('fabrics', 'fabrics.id', '=', 'receipts.fabric_id')
                ->join('users', 'users.id', '=', 'deliveries.user_id')
                ->join('stores', 'stores.id', '=', 'deliveries.store_id')
                ->join('suppliers', 'suppliers.id', '=', 'deliveries.contact_id')
                ->select(
                    'deliveries.id',
                    'deliveries.created_at',
                    'deliveries.receipt_id',
                    'receipts.lot_no',
                    'receipts.brand',
                    'receipts.cloth',
                    'deliveries.contact_id',
                    DB::raw("suppliers.name as [contact]"),
                    'receipts.fabric_id',
                    DB::raw('fabrics.name as fabric'),
                    'deliveries.remarks',
                    DB::raw('users.name as [user]'),
                    DB::raw('sum(delivery_items.rolls) as rolls'),
                    DB::raw('sum(delivery_items.weight) as weight'),
                )
                ->whereIn('deliveries.store_id', $store_ids)
                ->groupBy('deliveries.id', 'deliveries.created_at', 'deliveries.receipt_id', 'receipts.lot_no', 'receipts.brand', 'deliveries.contact_id', 'receipts.fabric_id', 'fabrics.name', 'deliveries.remarks', 'users.name','suppliers.name','receipts.cloth')
                ->orderBy('deliveries.id')
                ->paginate(10);

            return DeliveryResource::collection($deliveries);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDeliveryRequest $request)
    {
        $request->validated();
        try {
            DB::beginTransaction();
            $masters = $request->except('delivery_items');
            $delivery = Delivery::create($masters);
            $details = $request->delivery_items;

            $receipt = Receipt::find($masters['receipt_id']);
            $receipt->update([
                'is_locked' => true
            ]);

            foreach ($details as $key => $value) {
                DeliveryItem::create([
                    'delivery_id' => $delivery->id,
                    'color_id' => $value['color_id'],
                    'dia' => $value['dia'],
                    'rolls' => $value['rolls'],
                    'weight' => $value['weight'],
                    's_no' => $key + 1
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Delivered successfully', 'id' => $delivery->id]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Delivery $delivery)
    {
        $receiptMaster = Receipt::find($delivery->receipt_id);
        $deliveryDetails = DeliveryItem::where('delivery_id', $delivery->id)->orderBy('s_no')->get();
        $stockDetails = Stock::where('id', $delivery->receipt_id)->orderBy('s_no')->get();
        return response()->json(['receiptMaster' => $receiptMaster, 'deliveryMaster' => $delivery, 'deliveryDetails' => $deliveryDetails, 'stockDetails' => $stockDetails]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDeliveryRequest $request, Delivery $delivery)
    {
        $request->validated();
        try {
            DB::beginTransaction();
            $masters = $request->except('delivery_items');
            $delivery->update($masters);
            $details = $request->delivery_items;

            $receipt = Receipt::find($masters['receipt_id']);
            $receipt->update([
                'is_locked' => true
            ]);

            DeliveryItem::where('delivery_id', $delivery->id)->delete();

            foreach ($details as $key => $value) {
                DeliveryItem::create([
                    'delivery_id' => $delivery->id,
                    'color_id' => $value['color_id'],
                    'dia' => $value['dia'],
                    'rolls' => $value['rolls'],
                    'weight' => $value['weight'],
                    's_no' => $key + 1
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Delivery updated successfully', 'id' => $delivery->id]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Delivery $delivery)
    {
        try {
            $receiptId = $delivery->receipt_id;
            DeliveryItem::where('delivery_id', $delivery->id)->delete();
            Delivery::where('id', $delivery->id)->delete();
            $deliveries = Delivery::where('receipt_id', $receiptId)->get();
            if (count($deliveries) === 0) {
                $receipt =  Receipt::find($receiptId);
                $receipt->update([
                    'is_locked' => false
                ]);
            }
            return response()->json(['message' => 'Delivery deleted']);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    public function stockReceipt(int $id)
    {
        $receiptMaster = Receipt::find($id);
        $stockDetails = Stock::where('id', $id)->orderBy('s_no')->get();

        return response()->json(['receiptMaster' => $receiptMaster, 'stockDetails' => $stockDetails]);
    }

    public function report(Delivery $delivery)
    {

        try {

            $masterSql  = "select d.id, d.created_at date, c.name company_name, c.address company_address, r.lot_no, r.brand,r.cloth, s.name store, su.name contact, f.name fabric,d.remarks, u.name [user]
                from deliveries d
                inner join receipts r on r.id = d.receipt_id
                inner join fabrics f on r.fabric_id = f.id
                inner join stores s on s.id = d.store_id
                inner join users u on d.user_id = u.id
                inner join companies c on c.id = r.company_id
                inner join suppliers su on su.id = d.contact_id
                where d.id = $delivery->id";

            $detailsSql = "select c.name color,dia,rolls,weight
                from delivery_items ri
                inner join colors c on c.id = ri.color_id
                where delivery_id = $delivery->id";

            $master = DB::select($masterSql);
            $details = DB::select($detailsSql);

            return response()->json(['master' => $master[0], 'details' => $details]);
        } catch (\Throwable $th) {

            return response()->json(['message' => $th->getMessage()], 500);
        }
    }
}
