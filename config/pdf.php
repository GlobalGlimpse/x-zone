<?php

return [
    'mode'                  => 'utf-8',
    'format'                => 'A4',
    'author'                => '',
    'subject'               => '',
    'keywords'              => '',
    'creator'               => 'Laravel Pdf',
    'display_mode'          => 'fullpage',
    'tempDir'               => base_path('../temp/'),
    'pdf_a'                 => false,
    'pdf_a_auto'            => false,
    'icc_profile_path'      => '',

    // DomPDF options
    'options' => [
        /**
         * The default paper size
         */
        'default_paper_size' => 'a4',

        /**
         * The default font family
         */
        'default_font' => 'DejaVu Sans',

        /**
         * The root directory of the DOMPDF installation
         */
        'root_dir' => realpath(base_path()),

        /**
         * The location of the DOMPDF font directory
         */
        'font_dir' => storage_path('fonts/'),

        /**
         * The location of the DOMPDF font cache directory
         */
        'font_cache' => storage_path('fonts/'),

        /**
         * The location of a temporary directory.
         */
        'temp_dir' => sys_get_temp_dir(),

        /**
         * Whether to enable font subsetting or not.
         */
        'enable_font_subsetting' => false,

        /**
         * The PDF rendering backend to use
         */
        'pdf_backend' => 'CPDF',

        /**
         * Whether to enable PDF/A mode
         */
        'pdfa_mode' => false,

        /**
         * Whether to enable remote file access
         */
        'enable_remote' => true,

        /**
         * Whether to enable JavaScript
         */
        'enable_javascript' => true,

        /**
         * Whether to enable HTML5 parsing
         */
        'enable_html5_parser' => true,

        /**
         * Image DPI setting
         */
        'dpi' => 96,

        /**
         * Enable inline PHP
         */
        'enable_php' => false,

        /**
         * Enable inline CSS
         */
        'enable_css_float' => true,

        /**
         * Enable CSS
         */
        'enable_css' => true,
    ],
];
