// ---------- Navigasi: tandai link aktif sesuai section yang terlihat ----------
const navbarLinks = document.querySelectorAll(".navbar-nav .nav-link");
const sections = Array.from(navbarLinks)
    .map((link) => ({
        link,
        section: document.querySelector(link.getAttribute("href"))
    }))
    .filter((item) => item.section);

function updateActiveLink() {
    const navbar = document.querySelector(".navbar");
    const scrollPosition = window.scrollY + navbar.offsetHeight + 40;
    let activeLink = sections[0].link;

    sections.forEach(({ link, section }) => {
        if (section.offsetTop <= scrollPosition) {
            activeLink = link;
        }
    });

    navbarLinks.forEach((link) => {
        link.classList.toggle("active", link === activeLink);
    });
}

navbarLinks.forEach((link) => {
    link.addEventListener("click", () => {
        navbarLinks.forEach((navbarLink) => navbarLink.classList.remove("active"));
        link.classList.add("active");
    });
});

window.addEventListener("scroll", updateActiveLink, { passive: true });
window.addEventListener("load", updateActiveLink);

// ---------- Tombol kembali ke atas ----------
const backToTopButton = document.querySelector("#BackToTop");

function updateBackToTop() {
    backToTopButton.classList.toggle("is-visible", window.scrollY > 300);
}

backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", updateBackToTop, { passive: true });
updateBackToTop();

// ---------- Modal detail destinasi: data diambil dari tombol pada kartu ----------
const destinationModalElement = document.querySelector("#destinationModal");
const destinationModal = bootstrap.Modal.getOrCreateInstance(destinationModalElement);
const destinationModalDestination = document.querySelector("#destinationModalDestination");
const destinationModalPackage = document.querySelector("#destinationModalPackage");
const destinationModalImage = document.querySelector("#destinationModalImage");
const destinationModalDuration = document.querySelector("#destinationModalDuration");
const destinationModalPrice = document.querySelector("#destinationModalPrice");
const destinationModalHighlight = document.querySelector("#destinationModalHighlight");
const destinationModalDescription = document.querySelector("#destinationModalDescription");

document.querySelectorAll(".destination-card-button").forEach((button) => {
    button.addEventListener("click", () => {
        const card = button.closest(".destination-card");
        const image = card.querySelector(".destination-card-image img");

        destinationModalDestination.textContent = card.querySelector(".destination-card-subtitle").textContent.trim();
        destinationModalPackage.textContent = button.dataset.package;
        destinationModalImage.src = button.dataset.modalImage;
        destinationModalImage.alt = image.alt;
        destinationModalDuration.textContent = button.dataset.duration;
        destinationModalPrice.textContent = button.dataset.price;
        destinationModalHighlight.textContent = button.dataset.highlight;
        destinationModalDescription.textContent = card.querySelector(".destination-card-description").textContent.trim();

        destinationModal.show();
    });
});

// ---------- Booking: ambil elemen form, invoice, dan tombol ----------
const bagianForm = document.getElementById("bagianForm");
const formBooking = document.getElementById("formBooking");
const bagianInvoice = document.getElementById("bagianInvoice");
const pesanError = document.getElementById("pesanError");
const inputNama = document.getElementById("nama");
const inputPaket = document.getElementById("paket");
const inputJumlah = document.getElementById("jumlah");
const inputBerangkat = document.getElementById("berangkat");
const bookingModalBody = document.querySelector("#bookingModal .modal-body");
const tombolKembali = document.getElementById("tombolKembali");

// ---------- Data paket: sesuaikan harga/durasi dengan tabel dan pilihan paket di HTML ----------
const dataPaket = {
    "Bali Escape": { durasi: "3 Hari 2 Malam", malam: 2, harga: 2450000 },
    "Bromo Sunrise Trip": { durasi: "2 Hari 1 Malam", malam: 1, harga: 1350000 },
    "Raja Ampat Discovery": { durasi: "4 Hari 3 Malam", malam: 3, harga: 5750000 },
    "Labuan Bajo Explorer": { durasi: "3 Hari 2 Malam", malam: 2, harga: 3950000 }
};

// ---------- Formatter harga dan tanggal untuk invoice ----------
function formatRupiah(angka) {
    return `Rp ${angka.toLocaleString("id-ID")}`;
}

function formatTanggal(tanggal) {
    return tanggal.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// ---------- Atur tanggal keberangkatan minimum: hari ini ----------
const hariIni = new Date();
hariIni.setHours(0, 0, 0, 0);
const tanggalMin = new Date(hariIni.getTime() - hariIni.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
inputBerangkat.min = tanggalMin;

// ---------- Submit booking: validasi data dan tampilkan invoice ----------
formBooking.addEventListener("submit", (event) => {
    event.preventDefault();

    const nama = inputNama.value.trim();
    const paket = inputPaket.value;
    const jumlah = Number(inputJumlah.value);
    const berangkat = inputBerangkat.value;
    const tglBerangkat = berangkat ? new Date(`${berangkat}T00:00:00`) : null;
    const daftarError = [];

    if (nama === "") {
        daftarError.push("Nama pemesan wajib diisi.");
    } else if (nama.length < 3) {
        daftarError.push("Nama pemesan minimal 3 karakter.");
    }

    if (!Object.prototype.hasOwnProperty.call(dataPaket, paket)) {
        daftarError.push("Silakan pilih paket wisata.");
    }

    if (inputJumlah.value === "" || !Number.isInteger(jumlah) || jumlah < 1 || jumlah > 20) {
        daftarError.push("Jumlah orang harus berupa bilangan bulat antara 1 dan 20.");
    }

    if (berangkat === "") {
        daftarError.push("Pilih tanggal keberangkatan hari ini atau setelahnya.");
    } else if (tglBerangkat < hariIni) {
        daftarError.push("Pilih tanggal keberangkatan hari ini atau setelahnya.");
    }

    if (daftarError.length > 0) {
        pesanError.innerHTML = daftarError.join("<br>");
        pesanError.classList.remove("d-none");
        return;
    }

    const detail = dataPaket[paket];
    const total = detail.harga * jumlah;

    pesanError.textContent = "";
    pesanError.classList.add("d-none");
    document.getElementById("outNama").textContent = nama;
    document.getElementById("outPaket").textContent = paket;
    document.getElementById("outBerangkat").textContent = formatTanggal(tglBerangkat);
    document.getElementById("outDurasi").textContent = detail.durasi;
    document.getElementById("outPeserta").textContent = `${jumlah} orang`;
    document.getElementById("outHarga").textContent = formatRupiah(detail.harga);
    document.getElementById("outTotal").textContent = formatRupiah(total);

    bagianForm.classList.add("d-none");
    bagianInvoice.classList.remove("d-none");
    bagianInvoice.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("invoiceTitle").focus({ preventScroll: true });
});

// ---------- Booking lagi: reset form dan kembali ke tampilan input ----------
tombolKembali.addEventListener("click", () => {
    formBooking.reset();
    pesanError.textContent = "";
    pesanError.classList.add("d-none");
    bagianInvoice.classList.add("d-none");
    bagianForm.classList.remove("d-none");
    bookingModalBody.scrollTo({ top: 0, behavior: "smooth" });
    inputNama.focus({ preventScroll: true });
});

// ---------- Testimoni: geser kartu dengan tombol panah ----------
(function () {
    const track = document.getElementById("testimoniTrack");
    const prev = document.getElementById("testimoniPrev");
    const next = document.getElementById("testimoniNext");
    if (!track || !prev || !next) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function stepWidth() {
        const card = track.querySelector(".testimoni-card");
        return card ? card.offsetWidth + 22 : 300;
    }

    function updateArrows() {
        prev.disabled = track.scrollLeft <= 4;
        next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    }

    function geser(arah) {
        track.scrollBy({ left: arah * stepWidth(), behavior: reduceMotion ? "auto" : "smooth" });
    }

    prev.addEventListener("click", () => geser(-1));
    next.addEventListener("click", () => geser(1));
    track.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    updateArrows();
})();
