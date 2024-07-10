<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ColorController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\FabricController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\SupplierController;
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
Route::apiResource('companies', CompanyController::class);
Route::post('/storeassign',[UserController::class,'storeAssign']);
Route::apiResource('receipts',ReceiptController::class);
Route::apiResource('deliveries',DeliveryController::class);
Route::get('/receipt-report/{receipt}',[ReceiptController::class,'report']);
Route::get('/userstores/{id}',[UserController::class,'userStores']);
Route::get('/deliverable-receipts',[ReceiptController::class,'deliverableReceipts']);
Route::get('/stock-receipt/{id}',[DeliveryController::class,'stockReceipt']);
Route::put('receipt-status-update/{id}',[ReceiptController::class,'updateCloseStatus']);
Route::get('/delivery-report/{delivery}',[DeliveryController::class,'report']);
Route::get('/lotsandbrands/{user}',[ReportController::class,'lotsAndBrands']);
Route::get('/stock',[ReportController::class,'stock']);
Route::get('/stock-report/{receipt}',[ReportController::class,'stockReport']);
Route::get('/suppliers',[SupplierController::class,'index']);
Route::get('/brands',[BrandController::class,'index']);
Route::put('/brand-update/{id}',[BrandController::class,'brandUpdate']);


