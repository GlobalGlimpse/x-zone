<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use App\Http\Controllers\{
    UserController,
    RoleController,
    PermissionController,
    CategoryController,
    ProductController,
    AuditLogExportController,
    LoginLogController,
    LoginLogExportController,
    TaxRateController,
    CurrencyController,
    AppSettingController,
    AuditLogController,
    StockMovementController,
    ProviderController,
    QuoteController,
    ClientController,
    OrderController,
    StockMovementReasonController,
    InvoiceController,
};
use Spatie\Activitylog\Models\Activity;

/*
|--------------------------------------------------------------------------
| Accueil public
|--------------------------------------------------------------------------
*/
Route::get('/', fn () => Redirect::route('login'))->name('home');
/*
|--------------------------------------------------------------------------
| Zone protégée (auth + verified)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    /* ------------------------------------------------------------------ */
    /* Dashboard                                                          */
    /* ------------------------------------------------------------------ */
    Route::get('/dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');

    /* ------------------------------------------------------------------ */
    /* Catalogue – Catégories                                             */
    /* ------------------------------------------------------------------ */
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/',                [CategoryController::class, 'index'  ])->middleware('permission:category_list'  )->name('index');
        Route::get('/create',          [CategoryController::class, 'create' ])->middleware('permission:category_create')->name('create');
        Route::post('/',               [CategoryController::class, 'store'  ])->middleware('permission:category_create')->name('store');
        Route::get('/{category}',      [CategoryController::class, 'show'   ])->middleware('permission:category_show'  )->name('show');
        Route::get('/{category}/edit', [CategoryController::class, 'edit'   ])->middleware('permission:category_edit'  )->name('edit');
        Route::patch('/{category}',    [CategoryController::class, 'update' ])->middleware('permission:category_edit'  )->name('update');
        Route::delete('/{category}',   [CategoryController::class, 'destroy'])->middleware('permission:category_delete')->name('destroy');
        Route::post('/{id}/restore',   [CategoryController::class, 'restore'])->middleware('permission:category_restore')->name('restore');
        Route::delete('/{id}/force-delete', [CategoryController::class, 'forceDelete'])->middleware('permission:category_delete')->name('force-delete');
    });

    /* ------------------------------------------------------------------ */
    /* Catalogue – Produits                                               */
    /* ------------------------------------------------------------------ */

    /* ------------------------------------------------------------------ */
    /* Clients                                                            */
    /* ------------------------------------------------------------------ */
    Route::prefix('clients')->name('clients.')->group(function () {
        Route::get('/',                [ClientController::class, 'index'  ])->name('index');
        Route::get('/create',          [ClientController::class, 'create' ])->name('create');
        Route::post('/',               [ClientController::class, 'store'  ])->name('store');
        Route::get('/{client}',        [ClientController::class, 'show'   ])->name('show');
        Route::get('/{client}/edit',   [ClientController::class, 'edit'   ])->name('edit');
        Route::patch('/{client}',      [ClientController::class, 'update' ])->name('update');
        Route::delete('/{client}',     [ClientController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore',   [ClientController::class, 'restore'])->name('restore');
    });

    /* ------------------------------------------------------------------ */
    /* Devis                                                              */
    /* ------------------------------------------------------------------ */
    Route::prefix('quotes')->name('quotes.')->group(function () {
        Route::get('/',                [QuoteController::class, 'index']        )->name('index');
        Route::get('/create',          [QuoteController::class, 'create']       )->name('create');
        Route::post('/',               [QuoteController::class, 'store']        )->name('store');
        Route::get('/{quote}',         [QuoteController::class, 'show']         )->name('show');
        Route::get('/{quote}/edit',    [QuoteController::class, 'edit']         )->name('edit');
        Route::patch('/{quote}',       [QuoteController::class, 'update']       )->name('update');
        Route::delete('/{quote}',      [QuoteController::class, 'destroy']      )->name('destroy');

        // Actions spéciales
        Route::post('/{quote}/change-status',    [QuoteController::class, 'changeStatus'])->name('change-status');
        Route::post('/{quote}/convert-to-order', [QuoteController::class, 'convertToOrder'])->name('convert-to-order');
        Route::post('/{quote}/convert-to-invoice', [QuoteController::class, 'convertToInvoice'])->name('convert-to-invoice');
        Route::post('/{quote}/duplicate',        [QuoteController::class, 'duplicate'])->name('duplicate');
        Route::get('/{quote}/export',            [QuoteController::class, 'export'])->name('export');
    });

    /* ------------------------------------------------------------------ */
    /* Commandes                                                          */
    /* ------------------------------------------------------------------ */
    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/',           [OrderController::class, 'index'])->name('index');
        Route::get('/{order}',    [OrderController::class, 'show' ])->name('show');
    });

    Route::prefix('products')->name('products.')->group(function () {

        /* --- Route statique avant les paramètres dynamiques ------------- */
        Route::get('/compatible-list', [ProductController::class, 'compatibleList'])
            ->middleware('permission:product_list')
            ->name('compatible-list');

        /* --- CRUD principal -------------------------------------------- */
        Route::get('/',                [ProductController::class, 'index'  ])->middleware('permission:product_list'  )->name('index');
        Route::get('/create',          [ProductController::class, 'create' ])->middleware('permission:product_create')->name('create');
        Route::post('/',               [ProductController::class, 'store'  ])->middleware('permission:product_create')->name('store');

        /* Tout ce qui contient {product} vient après ! */
        Route::get('/{product}',       [ProductController::class, 'show'   ])->middleware('permission:product_show'  )->name('show');
        Route::get('/{product}/edit',  [ProductController::class, 'edit'   ])->middleware('permission:product_edit'  )->name('edit');
        Route::patch('/{product}',     [ProductController::class, 'update' ])->middleware('permission:product_edit'  )->name('update');
        Route::delete('/{product}',    [ProductController::class, 'destroy'])->middleware('permission:product_delete')->name('destroy');

        Route::post('/{id}/restore',        [ProductController::class, 'restore'    ])->middleware('permission:product_restore')->name('restore');
        Route::delete('/{id}/force-delete', [ProductController::class, 'forceDelete'])->middleware('permission:product_delete')->name('force-delete');
    });

    /* ------------------------------------------------------------------ */
    /* Gestion de Stock                                                   */
    /* ------------------------------------------------------------------ */
    Route::prefix('stock-movements')->name('stock-movements.')->group(function () {
        Route::get('/',                [StockMovementController::class, 'index'  ])->middleware('permission:stock_list'  )->name('index');
        Route::get('/create',          [StockMovementController::class, 'create' ])->middleware('permission:stock_create')->name('create');
        Route::post('/',               [StockMovementController::class, 'store'  ])->middleware('permission:stock_create')->name('store');
        Route::get('/report',          [StockMovementController::class, 'report' ])->middleware('permission:stock_list'  )->name('report');
        Route::get('/export',          [StockMovementController::class, 'export' ])->middleware('permission:stock_list'  )->name('export');

        Route::get('/{stockMovement}',      [StockMovementController::class, 'show'   ])->middleware('permission:stock_list'  )->name('show');
        Route::get('/{stockMovement}/edit', [StockMovementController::class, 'edit'   ])->middleware('permission:stock_edit'  )->name('edit');
        Route::patch('/{stockMovement}',    [StockMovementController::class, 'update' ])->middleware('permission:stock_edit'  )->name('update');
        Route::delete('/{stockMovement}',   [StockMovementController::class, 'destroy'])->middleware('permission:stock_delete')->name('destroy');

        Route::post('/{id}/restore',        [StockMovementController::class, 'restore'])->middleware('permission:stock_edit'  )->name('restore');
        Route::delete('/{id}/force-delete', [StockMovementController::class, 'forceDelete'])->middleware('permission:stock_delete')->name('force-delete');
    });

    /* ------------------------------------------------------------------ */
    /* Fournisseurs                                                       */
    /* ------------------------------------------------------------------ */
    Route::prefix('providers')->name('providers.')->group(function () {
        Route::get('/',                [ProviderController::class, 'index'  ])->middleware('permission:stock_list'  )->name('index');
        Route::get('/create',          [ProviderController::class, 'create' ])->middleware('permission:stock_create')->name('create');
        Route::post('/',               [ProviderController::class, 'store'  ])->middleware('permission:stock_create')->name('store');
        Route::get('/{provider}',      [ProviderController::class, 'show'   ])->middleware('permission:stock_list'  )->name('show');
        Route::get('/{provider}/edit', [ProviderController::class, 'edit'   ])->middleware('permission:stock_edit'  )->name('edit');
        Route::patch('/{provider}',    [ProviderController::class, 'update' ])->middleware('permission:stock_edit'  )->name('update');
        Route::delete('/{provider}',   [ProviderController::class, 'destroy'])->middleware('permission:stock_delete')->name('destroy');
        Route::post('/{id}/restore',   [ProviderController::class, 'restore'])->middleware('permission:stock_edit'  )->name('restore');
    });

    /* ------------------------------------------------------------------ */
    /* Motifs de mouvements de stock                                      */
    /* ------------------------------------------------------------------ */
    Route::prefix('stock-movement-reasons')->name('stock-movement-reasons.')->group(function () {
        Route::get('/',                [StockMovementReasonController::class, 'index'  ])->middleware('permission:stock_list'  )->name('index');
        Route::get('/create',          [StockMovementReasonController::class, 'create' ])->middleware('permission:stock_create')->name('create');
        Route::post('/',               [StockMovementReasonController::class, 'store'  ])->middleware('permission:stock_create')->name('store');
        Route::get('/{stockMovementReason}',      [StockMovementReasonController::class, 'show'   ])->middleware('permission:stock_list'  )->name('show');
        Route::get('/{stockMovementReason}/edit', [StockMovementReasonController::class, 'edit'   ])->middleware('permission:stock_edit'  )->name('edit');
        Route::patch('/{stockMovementReason}',    [StockMovementReasonController::class, 'update' ])->middleware('permission:stock_edit'  )->name('update');
        Route::delete('/{stockMovementReason}',   [StockMovementReasonController::class, 'destroy'])->middleware('permission:stock_delete')->name('destroy');
        Route::post('/{id}/restore',             [StockMovementReasonController::class, 'restore'])->middleware('permission:stock_edit'  )->name('restore');
    });

    /* ------------------------------------------------------------------ */
    /* Taxes                                                              */
    /* ------------------------------------------------------------------ */
    Route::prefix('tax-rates')->name('taxrates.')->group(function () {
        Route::get('/',                [TaxRateController::class, 'index'  ])->middleware('permission:taxrate_list'  )->name('index');
        Route::get('/create',          [TaxRateController::class, 'create' ])->middleware('permission:taxrate_create')->name('create');
        Route::get('/{taxRate}',       [TaxRateController::class, 'show'   ])->middleware('permission:taxrate_show'  )->name('show');
        Route::post('/',               [TaxRateController::class, 'store'  ])->middleware('permission:taxrate_create')->name('store');
        Route::get('/{taxRate}/edit',  [TaxRateController::class, 'edit'   ])->middleware('permission:taxrate_edit'  )->name('edit');
        Route::put('/{taxRate}',       [TaxRateController::class, 'update' ])->middleware('permission:taxrate_edit'  )->name('update');
        Route::delete('/{taxRate}',    [TaxRateController::class, 'destroy'])->middleware('permission:taxrate_delete')->name('destroy');
        Route::post('/{id}/restore',   [TaxRateController::class, 'restore'])->middleware('permission:taxrate_restore')->name('restore');
    });

    /* ------------------------------------------------------------------ */
    /* Devises                                                            */
    /* ------------------------------------------------------------------ */
    Route::prefix('currencies')->name('currencies.')->group(function () {
        Route::get('/',                [CurrencyController::class, 'index'  ])->middleware('permission:currency_list'  )->name('index');
        Route::get('/create',          [CurrencyController::class, 'create' ])->middleware('permission:currency_create')->name('create');
        Route::post('/',               [CurrencyController::class, 'store'  ])->middleware('permission:currency_create')->name('store');
        Route::get('/{currency}',      [CurrencyController::class, 'show'   ])->middleware('permission:currency_show'  )->name('show');
        Route::get('/{currency}/edit', [CurrencyController::class, 'edit'   ])->middleware('permission:currency_edit'  )->name('edit');
        Route::put('/{currency}',      [CurrencyController::class, 'update' ])->middleware('permission:currency_edit'  )->name('update');
        Route::delete('/{currency}',   [CurrencyController::class, 'destroy'])->middleware('permission:currency_delete')->name('destroy');
        Route::post('/{id}/restore',   [CurrencyController::class, 'restore'])->middleware('permission:currency_restore')->name('restore');
    });

    /* ------------------------------------------------------------------ */
    /* Utilisateurs                                                       */
    /* ------------------------------------------------------------------ */
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/',                [UserController::class, 'index'  ])->name('index');
        Route::get('/export',          [UserController::class, 'export' ])->name('export');
        Route::get('/create',          [UserController::class, 'create' ])->name('create');
        Route::post('/',               [UserController::class, 'store'  ])->name('store');
        Route::get('/{id}',            [UserController::class, 'show'   ])->name('show');
        Route::get('/{user}/edit',     [UserController::class, 'edit'   ])->name('edit');
        Route::patch('/{user}',        [UserController::class, 'update' ])->name('update');
        Route::post('/{id}/restore',   [UserController::class, 'restore'])->name('restore');
        Route::delete('/{id}',         [UserController::class, 'destroy'])->name('destroy');
        Route::delete('/{id}/force-delete', [UserController::class, 'forceDelete'])->name('force-delete');
    });

    /* ------------------------------------------------------------------ */
    /* Rôles                                                              */
    /* ------------------------------------------------------------------ */
    Route::prefix('roles')->name('roles.')->group(function () {
        Route::get('/',                [RoleController::class, 'index'  ])->name('index');
        Route::get('/create',          [RoleController::class, 'create' ])->name('create');
        Route::post('/',               [RoleController::class, 'store'  ])->name('store');
        Route::get('/{id}',            [RoleController::class, 'show'   ])->name('show');
        Route::get('/{role}/edit',     [RoleController::class, 'edit'   ])->name('edit');
        Route::patch('/{role}',        [RoleController::class, 'update' ])->name('update');
        Route::delete('/{id}',         [RoleController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore',   [RoleController::class, 'restore'])->name('restore');
    });

    /* ------------------------------------------------------------------ */
    /* Permissions                                                        */
    /* ------------------------------------------------------------------ */
    Route::prefix('permissions')->name('permissions.')->group(function () {
        Route::get('/',                [PermissionController::class, 'index' ])->name('index');
        Route::get('/create',          [PermissionController::class, 'create'])->name('create');
        Route::post('/',               [PermissionController::class, 'store' ])->name('store');
        Route::get('/{permission}',       [PermissionController::class, 'show' ])->name('show');
        Route::get('/{permission}/edit', [PermissionController::class, 'edit' ])->name('edit');
        Route::patch('/{permission}',  [PermissionController::class, 'update'])->name('update');
        Route::delete('/{id}',         [PermissionController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore',   [PermissionController::class, 'restore'])->name('restore');
    });

    /* ------------------------------------------------------------------ */
    /* Factures                                                           */
    /* ------------------------------------------------------------------ */
    Route::prefix('invoices')->name('invoices.')->group(function () {
        Route::get('/', [InvoiceController::class, 'index'])->name('index');
        Route::get('/{invoice}', [InvoiceController::class, 'show'])->name('show');
        Route::get('/{invoice}/export-pdf', [InvoiceController::class, 'exportPdf'])->name('export-pdf');
        Route::get('/{invoice}/edit', [InvoiceController::class, 'edit'])->name('edit');
        Route::patch('/{invoice}', [InvoiceController::class, 'update'])->name('update');
        Route::post('/{invoice}/duplicate', [InvoiceController::class, 'duplicate'])->name('duplicate');
        Route::post('/{invoice}/send', [InvoiceController::class, 'send'])->name('send');
        Route::post('/{invoice}/mark-paid', [InvoiceController::class, 'markAsPaid'])->name('mark-paid');
        Route::post('/{invoice}/send-reminder', [InvoiceController::class, 'sendReminder'])->name('send-reminder');
        Route::post('/{invoice}/change-status', [InvoiceController::class, 'changeStatus'])->name('change-status');
        Route::post('/{invoice}/reopen', [InvoiceController::class, 'reopen'])->middleware('permission:invoice_reopen')->name('reopen');
    });

    /* ------------------------------------------------------------------ */
    /* Logs d'audit & de connexion                                        */
    /* ------------------------------------------------------------------ */
    Route::get('/audit-logs', function () {
        $logs = Activity::with('causer')->latest()->get();

        return Inertia::render('audit-logs/Index', [
            'logs' => [
                'data'         => $logs,
                'current_page' => 1,
                'per_page'     => 10,
                'total'        => $logs->count(),
            ],
        ]);
    })->name('audit-logs.index');

    Route::get('/audit-logs/export', [AuditLogExportController::class, 'export'])->name('audit-logs.export');
    Route::get('/login-logs',        [LoginLogController::class, 'index' ])->name('login-logs.index');
    Route::get('/login-logs/export', [LoginLogExportController::class, 'export'])->name('login-logs.export');

    // Ex. paramétrage application
    // Route::prefix('settings')->name('settings.')->group(function () {
    //     Route::get('/app', [AppSettingController::class, 'edit'])->name('app.edit');
    //     Route::post('/app', [AppSettingController::class, 'update'])->name('app.update');
    // });
});

/* ---------------------------------------------------------------------- */
/* Autres fichiers de routes                                              */
/* ---------------------------------------------------------------------- */
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
