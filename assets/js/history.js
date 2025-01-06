// Contoh endpoint API (ubah sesuai dengan endpoint Anda)
const apiEndpoint = "https://api.example.com/orders";

async function fetchOrderHistory() {
  try {
    const response = await fetch(apiEndpoint);
    const data = await response.json();

    const orderHistory = document.getElementById("orderHistory");
    orderHistory.innerHTML = ""; // Bersihkan konten sebelumnya

    data.forEach((order) => {
      const row = `
           <tr>
             <td class="text-center px-6 py-4 text-gray-700">${order.date}</td>
             <td class="text-center px-6 py-4 text-gray-700 truncate">${
               order.orderId
             }</td>
             <td class="text-center px-6 py-4 text-gray-700">${
               order.transactionType
             }</td>
             <td class="text-center px-6 py-4 text-gray-700">${
               order.channel
             }</td>
             <td class="text-center px-6 py-4 text-gray-700">
               <span class="text-xs font-semibold px-2 py-1 rounded-full ${
                 order.status === "Kedaluwarsa"
                   ? "bg-red-100 text-red-600"
                   : "bg-green-100 text-green-600"
               }">
                 ${order.status}
               </span>
             </td>
             <td class="text-center px-6 py-4 text-gray-700">${
               order.amount
             }</td>
             <td class="text-center px-6 py-4 text-gray-700 truncate">${
               order.customerEmail
             }</td>
           </tr>
         `;
      orderHistory.innerHTML += row;
    });
  } catch (error) {
    console.error("Error fetching order history:", error);
  }
}

// Muat data ketika halaman dimuat
window.onload = fetchOrderHistory;

// ------------------------------------------------------------------------------

// logout botton
function checkLoginStatus() {
  // Cek status login dari localStorage
  const token = localStorage.getItem("token"); // Simpan token login di localStorage
  return token !== null; // Jika token ada, anggap user sudah login
}

function updateLoginButton() {
  const profileContainer = document.querySelector(".profil");

  if (checkLoginStatus()) {
    // Jika user sudah login, tampilkan tombol Logout
    profileContainer.innerHTML = `
        <button
          id="logoutButton"
          class="pr-7 pl-7 pb-2 pt-2 bg-red-500 hover:bg-red-700 rounded-3xl text-white"
        >
          Logout
        </button>
      `;

    // Tambahkan event listener untuk tombol Logout
    document.getElementById("logoutButton").addEventListener("click", () => {
      localStorage.removeItem("token"); // Hapus token dari localStorage
      alert("Anda telah logout.");
      updateLoginButton(); // Perbarui tampilan tombol
    });
  } else {
    // Jika user belum login, tampilkan tombol Login
    profileContainer.innerHTML = `
      <a
        href="${window.location.origin}/tokline.github.io/src/page/auth/login.html"
        class="pr-7 pl-7 pb-2 pt-2 bg-sky-500 hover:bg-sky-700 rounded-3xl text-white"
      >
        Login
      </a>
    `;
  }
}

// Panggil fungsi saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", updateLoginButton);

// ---------------------------------------------------------------------------

async function fetchTransactionByToken() {
  const token = localStorage.getItem("token"); // Mendapatkan token dari localStorage
  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "Anda belum login",
      text: "Silakan login terlebih dahulu untuk melihat riwayat transaksi.",
      confirmButtonText: "Login",
    }).then(() => {
      window.location.href = "/tokline.github.io/src/page/auth/login.html"; // Redirect ke halaman login
    });
    return;
  }

  try {
    // Dekode token untuk mendapatkan id
    const decodedToken = parseJwt(token);
    console.log("Decoded Token:", decodedToken); // Debug token

    const userId = decodedToken.id; // Pastikan menggunakan atribut "id" dari token
    console.log("User ID dari Token:", userId); // Debug userId

    if (typeof userId === "undefined" || userId === null) {
      console.error("userId tidak ditemukan dalam decodedToken:", decodedToken);
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: "Gagal mendapatkan ID pengguna dari token.",
      });
      return;
    }

    const apiEndpoint = `https://backend-eight-phi-75.vercel.app/api/payment/transactions/${userId}`;
    console.log("API Endpoint:", apiEndpoint); // Debug API Endpoint

    const response = await fetch(apiEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token sebagai header
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data dari API:", data); // Debug respons API

    const orderHistory = document.getElementById("orderHistory");
    orderHistory.innerHTML = ""; // Bersihkan konten sebelumnya

    if (data.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Tidak Ada Transaksi",
        text: "Anda belum memiliki transaksi.",
      });
      return;
    }

    data.forEach((transaction) => {
      const row = `
        <tr>
          <td class="text-center px-6 py-4 text-gray-700">${
            transaction.transaksi_id
          }</td>
          <td class="text-center px-6 py-4 text-gray-700">${
            transaction.nama_produk
          }</td>
          <td class="text-center px-6 py-4 text-gray-700">${
            transaction.jumlah
          }</td>
          <td class="text-center px-6 py-4 text-gray-700">${
            transaction.gross_amount
          }</td>
          <td class="text-center px-6 py-4 text-gray-700">
            <span class="text-xs font-semibold px-2 py-1 rounded-full ${
              transaction.status === "paid"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }">
              ${transaction.status}
            </span>
          </td>
          <td class="text-center px-6 py-4 text-gray-700">
            <a href="${
              transaction.snap_url
            }" target="_blank" class="text-blue-500 underline">
              Lihat Detail
            </a>
          </td>
          <td class="text-center px-6 py-4 text-gray-700">${new Date(
            transaction.created_at
          ).toLocaleString()}</td>
        </tr>
      `;
      orderHistory.innerHTML += row;
    });

    Swal.fire({
      icon: "success",
      title: "Data Berhasil Dimuat",
      text: "Riwayat transaksi Anda telah ditampilkan.",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Error fetching transaction by token:", error);

    Swal.fire({
      icon: "error",
      title: "Gagal Memuat Data",
      text: "Terjadi kesalahan saat memuat data transaksi. Silakan coba lagi.",
    });
  }
}

// Panggil fungsi saat halaman selesai dimuat
window.onload = fetchTransactionByToken;

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    console.log("Decoded Payload:", JSON.parse(jsonPayload)); // Debug payload
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to parse JWT:", error);
    return null;
  }
}
