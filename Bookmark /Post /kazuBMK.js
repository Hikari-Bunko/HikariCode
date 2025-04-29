
        // Inisialisasi IndexedDB
        let db;
        const request = indexedDB.open('bookmarkDB', 1);

        request.onupgradeneeded = function(event) {
            db = event.target.result;
            db.createObjectStore('bookmarks', { keyPath: 'id', autoIncrement: true });
        };

        request.onsuccess = function(event) {
            db = event.target.result;
        };

        function showNotification(message) {
            const notification = document.getElementById('kazuNotif');
            notification.innerText = message;
            notification.style.display = 'block';

            setTimeout(() => {
                notification.style.display = 'none';
                notification.innerHTML = ''; // Kosongkan isi notifikasi
            }, 3000); // Sembunyikan setelah 3 detik
        }

        document.getElementById('bookmarkBtn').addEventListener('click', function() {
            const pageTitle = document.title;
            const pageUrl = window.location.href;

            // Mencari gambar dari elemen <img> pertama
            const imgElement = document.querySelector('img');
            let thumbnailUrl = imgElement ? imgElement.src : 'https://via.placeholder.com/150'; // Gambar default jika tidak ada gambar

            // Mencari gambar dari tag <meta> Open Graph
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage) {
                thumbnailUrl = ogImage.content;
            }

            const category = prompt("Masukkan kategori bookmark (opsional):") || "Umum"; // Kategori

            // Cek apakah URL sudah ada di database
            const transaction = db.transaction(['bookmarks'], 'readonly');
            const store = transaction.objectStore('bookmarks');
            const getRequest = store.getAll();

            getRequest.onsuccess = function() {
                const bookmarks = getRequest.result;
                const isDuplicate = bookmarks.some(bookmark => bookmark.url === pageUrl);

                if (isDuplicate) {
                    alert('Bookmark ini sudah ada!');
                } else {
                    // Jika tidak ada duplikasi, tambahkan bookmark
                    const addTransaction = db.transaction(['bookmarks'], 'readwrite');
                    const addStore = addTransaction.objectStore('bookmarks');
                    addStore.add({ title: pageTitle, url: pageUrl, thumbnail: thumbnailUrl, category: category, date: new Date(), favorite: false });

                    // Ubah teks tombol menjadi "Bookmarked"
                    this.innerText = 'Bookmarked';
                    this.disabled = true; // Menonaktifkan tombol setelah dibookmark

                    showNotification('Halaman ini telah dibookmark!');
                }
            }.bind(this); // Bind 'this' untuk mengakses tombol
        });
