<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ColorController;
use App\Http\Controllers\FabricController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('login', [AuthController::class, 'login']);
Route::post('logout', [AuthController::class, 'logout']);
Route::apiResource('users', UserController::class);
Route::apiResource('stores', StoreController::class);
Route::apiResource('colors', ColorController::class);
Route::apiResource('fabrics', FabricController::class);
Route::post('/storeassign',[UserController::class,'storeAssign']);
Route::apiResource('receipts',ReceiptController::class);
