document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const imageInput = document.getElementById('image-input'); // Input file untuk gambar
    const imageButton = document.getElementById('image-button'); // Tombol untuk memilih gambar
    let messages = JSON.parse(localStorage.getItem('messages')) || [];

    // Menampilkan pesan yang tersimpan saat memuat ulang halaman
    messages.forEach(function(message) {
        appendMessage(message);
    });

    sendButton.addEventListener('click', function() {
        try {
            const messageText = messageInput.value.trim();
            if (messageText !== '') {
                if (messageText === '/clear') {
                    clearChat();
                } else {
                    sendMessage(messageText, 'sent');
                }
            }
        } catch (error) {
            console.error('Error sending message:', error.message);
            alert('An error occurred while sending the message.');
        }
    });

    imageButton.addEventListener('click', function() {
        imageInput.click(); // Klik input file saat tombol gambar diklik
    });

    imageInput.addEventListener('change', function(event) {
        try {
            const imageFile = event.target.files[0]; // Ambil file gambar dari input file
            const maxSize = 6 * 1024 * 1024; // 6 MB dalam byte
            if (imageFile.size <= maxSize) {
                resizeImageAndSend(imageFile); // Panggil fungsi resizeImageAndSend
            } else {
                alert('The image size exceeds the maximum limit of 6 MB.');
            }
        } catch (error) {
            console.error('Error sending image:', error.message);
            alert('An error occurred while sending the image.');
        }
    });

    // Fungsi untuk merender gambar ke ukuran yang lebih kecil
    function resizeImageAndSend(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Tentukan ukuran yang diinginkan untuk gambar yang diubah
                const maxWidth = 300;
                const maxHeight = 300;
                let width = img.width;
                let height = img.height;

                // Periksa apakah perlu menyesuaikan ukuran gambar
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                // Mengatur ukuran canvas
                canvas.width = width;
                canvas.height = height;

                // Menggambar gambar yang diubah ke canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Dapatkan data URL dari gambar yang diubah
                const dataUrl = canvas.toDataURL('image/jpeg');

                // Kirim data URL atau lakukan operasi lain, misalnya kirim ke server
                sendMessage(null, 'sent', dataUrl);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Modifikasi fungsi sendMessage untuk menangani gambar yang dikirim
    function sendMessage(message, type, imageFile) {
        try {
            if (imageFile) { // Jika ada file gambar
                appendMessage({ image: imageFile, type }); // Tambahkan pesan dengan gambar
            } else { // Jika tidak ada file gambar, kirim pesan teks biasa
                appendMessage({ text: message, type });
            }
            // Menyimpan pesan baru ke penyimpanan lokal
            messages.push({ text: message, image: imageFile, type });
            localStorage.setItem('messages', JSON.stringify(messages));
            messageInput.value = '';
        } catch (error) {
            console.error('Error sending message:', error.message);
            alert('An error occurred while sending the message.');
        }
    }

    function appendMessage(message) {
        try {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            if (message.text) { // Jika pesan adalah teks
                messageElement.innerText = message.text;
            } else if (message.image) { // Jika pesan adalah gambar
                const imageElement = document.createElement('img');
                imageElement.src = message.image;
                imageElement.classList.add('message-image');
                imageElement.style.maxWidth = '100%'; // Membatasi lebar gambar agar tidak melebihi lebar parent
                imageElement.addEventListener('click', function() {
                    if (!imageElement.classList.contains('message-image-zoom')) {
                        // Saat gambar belum di-zoom, tambahkan kelas message-image-zoom untuk menerapkan gaya CSS
                        imageElement.classList.add('message-image-zoom');
                    } else {
                        // Saat gambar sudah di-zoom, hapus kelas message-image-zoom untuk mengembalikan ke tampilan semula
                        imageElement.classList.remove('message-image-zoom');
                    }
                });
                messageElement.appendChild(imageElement);
            }
            if (message.type === 'sent') {
                messageElement.classList.add('sent'); // Pesan yang Anda kirim (kanan)
            } else {
                messageElement.classList.add('received'); // Pesan yang diterima (kiri)
            }
            chatMessages.appendChild(messageElement);
            // Scroll ke bawah
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error('Error appending message:', error.message);
            alert('An error occurred while appending the message.');
        }
    }

    function clearChat() {
        try {
            localStorage.removeItem('messages');
            chatMessages.innerHTML = '';
            messages = []; // Hapus pesan-pesan dari array juga
        } catch (error) {
            console.error('Error clearing chat:', error.message);
            alert('An error occurred while clearing the chat.');
        }
    }
});
