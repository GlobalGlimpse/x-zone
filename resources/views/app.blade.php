<!DOCTYPE html>
<html
    lang="{{ str_replace('_', '-', app()->getLocale()) }}"
    @class(['dark' => ($appearance ?? 'system') === 'dark'])
>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- 1️⃣  — Dark-mode “flash of un-themed” fix --}}
    <script>
        (function () {
            const appearance = '{{ $appearance ?? 'system' }}'
            if (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark')
            }
        })()
    </script>

    {{-- 2️⃣  — Background couleur instantanée --}}
    <style>
        html { background-color: oklch(1 0 0); }
        html.dark { background-color: oklch(0.145 0 0); }
    </style>

    {{-- 3️⃣  — Titre et favicon dynamiques --}}
    @php($settings = $page['props']['settings'] ?? [])
    <title inertia>
        {{ $settings['app_name'] ?? config('app.name', 'Laravel') }}
    </title>

    {{--  Favicon (PNG ou ICO) --}}
    @if(isset($settings['favicon_url']))
        <link rel="icon" type="image/png" href="{{ $settings['favicon_url'] }}">
    @endif

    {{--  (optionnel) Apple / Android icons --}}
    {{-- <link rel="apple-touch-icon" sizes="180x180" href="{{ $settings['favicon_url'] }}"> --}}
    {{-- <meta name="theme-color" content="#2563eb"> --}}

    {{-- 4️⃣  — Polices & assets --}}
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet"/>

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>
<body class="font-sans antialiased">
    @inertia
</body>
</html>
