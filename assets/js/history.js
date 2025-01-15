// Contoh endpoint API (ubah sesuai dengan endpoint Anda)
const apiEndpoint = "https://api.example.com/orders";

async function fetchOrderHistory() {
  try {
    const response = await fetch(apiEndpoint); // Ganti `apiEndpoint` dengan endpoint API Anda
    const data = await response.json();

    const orderHistory = document.getElementById("orderHistory");
    orderHistory.innerHTML = ""; // Bersihkan konten sebelumnya

    data.forEach((order) => {
      const card = `
        <div class="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
          <div class="flex items-start">
            <img
              src="${order.productImage || "https://via.placeholder.com/80"}"
              alt="${order.productName}"
              class="w-16 h-16 rounded-md mr-4"
            />
            <div>
              <h2 class="text-lg font-bold text-gray-800">${
                order.productName
              }</h2>
              <p class="text-sm text-gray-600">Variasi: ${
                order.variation || "-"
              }</p>
              <p class="text-sm text-gray-600">Jumlah: ${order.quantity}</p>
              <p class="text-sm text-gray-600">
                <span class="font-semibold">Status:</span> 
                <span class="${
                  order.status === "Kedaluwarsa"
                    ? "text-red-600"
                    : "text-green-600"
                }">${order.status}</span>
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-gray-800">Rp${order.totalPrice}</p>
            <button
              class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onclick="viewOrderDetails('${order.orderId}', '${
        order.productName
      }', '${order.totalPrice}', '${order.status}', '${order.variation}', '${
        order.quantity
      }')"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      `;
      orderHistory.innerHTML += card;
    });
  } catch (error) {
    console.error("Error fetching order history:", error);
  }
}

function viewOrderDetails(
  orderId,
  productName,
  totalPrice,
  status,
  variation,
  quantity
) {
  Swal.fire({
    title: `<strong>Detail Pesanan</strong>`,
    html: `
      <div class="text-left">
        <p><strong>Nama Produk:</strong> ${productName}</p>
        <p><strong>Variasi:</strong> ${variation || "-"}</p>
        <p><strong>Jumlah:</strong> ${quantity}</p>
        <p><strong>Total Harga:</strong> Rp${totalPrice}</p>
        <p><strong>Status:</strong> <span class="${
          status === "Kedaluwarsa" ? "text-red-600" : "text-green-600"
        }">${status}</span></p>
      </div>
    `,
    icon: "info",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#3b82f6",
  });
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

      Swal.fire({
        icon: "success",
        title: "Logout Berhasil",
        text: "Anda telah logout.",
        confirmButtonText: "OK",
      }).then(() => {
        updateLoginButton(); // Perbarui tampilan tombol
        window.location.href = "/login"; // Arahkan ke halaman login
      });
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
      window.location.href = "/login"; // Redirect ke halaman login
    });
    return;
  }

  try {
    // Dekode token untuk mendapatkan ID pengguna
    const decodedToken = parseJwt(token);
    const userId = decodedToken?.id_user;

    if (!userId) {
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: "Gagal mendapatkan ID pengguna dari token.",
      });
      return;
    }

    // Fetch data transaksi berdasarkan ID pengguna
    const transactionsEndpoint = `https://backend-eight-phi-75.vercel.app/api/payment/transactions/${userId}`;
    const response = await fetch(transactionsEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const transactions = await response.json();
    const orderHistory = document.getElementById("orderHistory");
    orderHistory.innerHTML = ""; // Bersihkan konten sebelumnya

    if (transactions.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Tidak Ada Transaksi",
        text: "Anda belum memiliki transaksi.",
      });
      return;
    }

    // Fetch semua produk untuk mendapatkan gambar produk
    const productsResponse = await fetch(
      "https://backend-eight-phi-75.vercel.app/api/produk/all",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Tambahkan token autentikasi
          "Content-Type": "application/json",
        },
      }
    );

    if (!productsResponse.ok) {
      throw new Error(`Error fetching products: ${productsResponse.status}`);
    }

    const products = await productsResponse.json();

    // Map produk berdasarkan ID
    const productMap = {};
    products.forEach((product) => {
      productMap[
        product.id_produk
      ] = `https://qzbythadanrtksusxdtq.supabase.co/storage/v1/object/public/gambar/${product.gambar}`;
    });

    // Render transaksi ke dalam card
    transactions.forEach((transaction) => {
      const productImage =
        productMap[transaction.id_produk] || "https://via.placeholder.com/80";

      const card = `
        <div class="bg-white rounded-lg shadow-md p-3 mb-3 flex items-center">
          <img
            src="${productImage}"
            alt="${transaction.nama_produk}"
            class="w-12 h-12 rounded-md mr-3 p-4"
          />
          <div class="flex-1">
            <h2 class="text-base font-bold text-gray-800">${
              transaction.nama_produk
            }</h2>
            <p class="text-sm text-gray-600">Jumlah: ${transaction.jumlah}</p>
            <p class="text-sm text-gray-600">Total Harga: Rp${
              transaction.gross_amount
            }</p>
            <p class="text-sm text-gray-600">
              <span class="font-semibold">Status:</span>
              <span class="${
                transaction.status === "paid"
                  ? "text-green-600"
                  : "text-red-600"
              }">${transaction.status}</span>
            </p>
            <p class="text-sm text-gray-500">Tanggal: ${new Date(
              transaction.created_at
            ).toLocaleString()}</p>
          </div>
          <a
            href="${transaction.snap_url}"
            target="_blank"
            class="ml-3 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            Lihat Status
          </a>
        </div>
      `;
      orderHistory.innerHTML += card;
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
