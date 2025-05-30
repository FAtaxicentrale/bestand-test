// Laad klanten zodra de pagina geladen is
document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("klantenBody");

  try {
    const resp = await fetch("/api/klanten");
    const klanten = await resp.json();

    klanten.forEach(klant => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${klant.naam || "-"}</td>
        <td>${klant.email || "-"}</td>
        <td>${klant.telefoon || "-"}</td>
        <td>${klant.aangemaakt ? new Date(klant.aangemaakt).toLocaleDateString() : "-"}</td>
        <td><button onclick="toonUitgebreideInfo('${klant.id}')">Meer info</button></td>
        <td><button onclick="toonKlantRitten('${klant.email}', '${klant.telefoon}')">Toon ritten</button></td>
      `;

      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error("Fout bij laden klanten:", e);
  }
});

// Ritten tonen van klant
window.toonKlantRitten = async function(email, telefoon) {
  let ritten = [];
  try {
    const resp = await fetch("https://fa-taxi-centrale.onrender.com/api/ritten");
    if (resp.ok) ritten = await resp.json();
  } catch (e) {
    console.error("Fout bij ophalen ritten:", e);
  }

  const klantRitten = ritten.filter(r =>
    (email && r.email === email) || (telefoon && r.telefoon === telefoon)
  );

  let html = `<h2>Ritten van klant</h2>`;
  if (!klantRitten.length) {
    html += `<p>Geen ritten gevonden.</p>`;
  } else {
    klantRitten.forEach(r => {
      html += `
        <div style="margin-bottom: 10px; padding: 10px; border: 1px solid #ccc;">
          <strong>Rit-ID:</strong> ${r.id || "-"}<br>
          <strong>Datum:</strong> ${r.datumtijd ? r.datumtijd.replace('T',' ') : "-"}<br>
          <strong>Van:</strong> ${r.ophaaladres || "-"}<br>
          <strong>Naar:</strong> ${r.afzetadres || "-"}<br>
          <strong>Status:</strong> ${r.status || "-"}<br>
          <strong>Prijs:</strong> €${r.prijs || "-"}
        </div>
      `;
    });
  }

  const w = window.open("", "klantritten", "width=500,height=600");
  w.document.write(`
    <html>
      <head><title>Klantritten</title></head>
      <body style="font-family:sans-serif;padding:20px;">
        ${html}
      </body>
    </html>
  `);
};

// Toon uitgebreide klantinfo in modal
async function toonUitgebreideInfo(klantId) {
  try {
    const klant = await fetch(`/api/klanten/${klantId}`).then(resp => resp.json());

    const modal = document.createElement('div');
    modal.style = `
      position:fixed;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      background:#fff;
      padding:20px;
      border-radius:8px;
      box-shadow:0 2px 8px rgba(0,0,0,0.2);
      z-index:1000;
      min-width:280px;
      max-width:90vw;
    `;

    modal.innerHTML = `
      <h3>Klantinformatie</h3>
      <p><strong>Naam:</strong> ${klant.naam}</p>
      <p><strong>E-mail:</strong> ${klant.email}</p>
      <p><strong>Telefoon:</strong> ${klant.telefoon}</p>
      <p><strong>Aangemaakt:</strong> ${klant.aangemaakt ? new Date(klant.aangemaakt).toLocaleString() : '-'}</p>
      <button id="sluit-modal-btn">Sluiten</button>
    `;

    document.body.appendChild(modal);
    document.getElementById('sluit-modal-btn').onclick = () => {
      document.body.removeChild(modal);
    };
  } catch (error) {
    console.error("Fout bij ophalen klantinfo:", error);
  }
}
