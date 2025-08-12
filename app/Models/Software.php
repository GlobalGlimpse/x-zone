<?php
namespace App\Models;

class Software extends SpecializedProduct
{

    protected $table = 'softwares';


    protected $fillable = [
        'name', 'version', 'os_support', 'type',
        'license_included', 'download_link', 'activation_instructions',
    ];
}
