<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Store;
use App\Models\UserStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpParser\Node\Stmt\TryCatch;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // $users = User::paginate(10);
        $users = User::leftJoin('user_stores', 'users.id', '=', 'user_stores.user_id')
            ->leftJoin('stores', 'stores.id', '=', 'user_stores.store_id')
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'users.role',
                'users.active',
                DB::raw('COUNT(stores.name) as count'),
                DB::raw("STRING_AGG(stores.name,', ') as stores"),
                DB::raw("STRING_AGG(stores.id, ',') as store_ids")
            )
            ->groupBy('users.id', 'users.name', 'users.email', 'users.role', 'users.active')
            ->paginate(10);
        return UserResource::collection($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        try {
            $data = $request->validated();

            User::create($data);
            return response()->json(['message' => 'user created']);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        try {
            $data = $request->validated();

            $user->update($data);
            return response()->json(['message' => 'user updated']);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        try {
            $message = $user->active ? 'suspended' : 'activated';
            $user->update(['active' => !$user->active]);
            return response()->json(['message' => 'user ' . $message]);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    public function storeAssign(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,id',
                'store_id' => 'array',
                'store_id.*' => 'exists:stores,id'
            ]);

            $stores = $request->store_id;

            UserStore::where('user_id', $request->user_id)->delete();

            foreach ($stores as $store) {
                UserStore::create([
                    'user_id' => $request->user_id,
                    'store_id' => $store
                ]);
            }

            return response()->json(['message' => 'user stores updated']);
        } catch (\Throwable $th) {

            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    public function userStores(int $id)
    {
        try {
            $user = User::find($id);
            if ($user->role === 'user') {
                $store_ids = UserStore::select('store_id')->where('user_id', $id)->pluck('store_id');
                $stores = Store::select('id', 'name')
                    ->whereIn('id', $store_ids)
                    ->where('active', 1)
                    ->orderBy('name')
                    ->get();
            } else {
                $stores = Store::select('id', 'name')
                    ->where('active', 1)
                    ->orderBy('name')
                    ->get();
            }
            return response()->json(['stores' => $stores]);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }
}
