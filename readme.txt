Stack ultra propre et moderne :
Laravel + Inertia.js + React (TSX).

Backend  				Frontend
Laravel (PHP)				React (TypeScript avec .tsx)
Inertia.js				Inertia.js
Pas Blade / Pas Livewire	

Laravel Framework 12.9.2

PHP 8.3.4 (cli) (built: Mar 13 2024 11:42:47) (NTS Visual C++ 2019 x64)
Copyright (c) The PHP Group
Zend Engine v4.3.4, Copyright (c) Zend Technologies

inertiajs/inertia-laravel           2.0.2   The Laravel adapter for Inertia.js.

Si les images ne s'affichent pas directement dans le site :

1 ) Ouvre ta session SSH puis place-toi à la racine du projet
bash
Copier
Modifier
cd ~/domains/globalglimpse.ma/public_html/xzone
# Vérifie qu'on voit bien 'artisan'
ls -l artisan
2 ) Nettoie l’ancien lien (au cas où)
bash
Copier
Modifier
rm -rf public/storage
3 ) Crée manuellement le lien symbolique
bash
Copier
Modifier
# Toujours depuis ~/domains/.../xzone
ln -s "$(pwd)/storage/app/public" "$(pwd)/public/storage"
(Si tu préfères la version absolue, remplace $(pwd) par le chemin complet.)

Vérifie :

bash
Copier
Modifier
ls -l public | grep storage
# ➜ storage -> ../storage/app/public   (doit apparaître)
4 ) Ajuste les permissions (lecture pour tout le monde)
bash
Copier
Modifier
find storage/app/public -type d -exec chmod 755 {} \;
find storage/app/public -type f -exec chmod 644 {} \;
5 ) Vide les caches Laravel (facultatif mais conseillé)
bash
Copier
Modifier
php artisan config:clear
php artisan route:clear
php artisan view:clear
6 ) Teste dans le navigateur
ruby
Copier
Modifier
https://x-zone.globalglimpse.ma/storage/logos/nom_de_ton_fichier.png
• Si l’image s’affiche : problème résolu !