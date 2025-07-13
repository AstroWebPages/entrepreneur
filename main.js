// ------------------------
// FUNCIONES MODAL PRODUCTOS
// ------------------------

function openModal(nombre, tipo, detalle, perfil, producto, facebook, ig, whatsapp, linkedin) {
  const modal = document.getElementById('customModal');
  const modalContent = document.getElementById('modalContent');

  let redesHtml = '';

  // Solo si existe y no está vacío
  if (facebook && facebook.trim() !== '' && facebook !== 'undefined') {
    redesHtml += `
      <a href="${facebook}" style="background-color: #3b5998; color: white; padding: 8px 12px; border-radius: 5px; text-decoration: none; font-weight: bold; font-family: sans-serif;" target="_blank" rel="noopener noreferrer">Facebook</a>
    `;
  }

  if (ig && ig.trim() !== '' && ig !== 'undefined') {
    redesHtml += `
      <a href="${ig}" style="background-color: #e4405f; color: white; padding: 8px 12px; border-radius: 5px; text-decoration: none; font-weight: bold; font-family: sans-serif;" target="_blank" rel="noopener noreferrer">Instagram</a>
    `;
  }

  if (whatsapp && whatsapp.trim() !== '' && whatsapp !== 'undefined') {
    // Si ya viene como URL completa, úsala
    let whatsappUrl = whatsapp.includes('http') ? whatsapp : `https://${whatsapp}`;
    redesHtml += `
      <a href="${whatsappUrl}" style="background-color: #25D366; color: white; padding: 8px 12px; border-radius: 5px; text-decoration: none; font-weight: bold; font-family: sans-serif;" target="_blank" rel="noopener noreferrer">WhatsApp</a>
    `;
  }

  if (linkedin && linkedin.trim() !== '' && linkedin !== 'undefined') {
    redesHtml += `
      <a href="${linkedin}" style="background-color: #0077b5; color: white; padding: 8px 12px; border-radius: 5px; text-decoration: none; font-weight: bold; font-family: sans-serif;" target="_blank" rel="noopener noreferrer">LinkedIn</a>
    `;
  }

  modalContent.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-height: 80vh; overflow-y: auto; align-items: start;">
      <div>
        <h2>${producto}</h2>
        <h3>${nombre}</h3>
        <p><strong>Tipo:</strong> ${tipo}</p>
        ${detalle}
      </div>
      <div style="position: sticky; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; justify-content: flex-start; align-items: center; max-height: 80vh; overflow: hidden;">
        <img src="${perfil}" alt="Perfil" style="max-width: 100%; max-height: 300px; border-radius: 50%; object-fit: cover; margin-bottom: 10px;">
        <div style="font-weight: bold; margin-bottom: 15px; text-align: center;">${nombre}</div>
        ${redesHtml !== '' ? `<div class="buttons-container">${redesHtml}</div>` : ''}
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  modal.querySelectorAll('.fake-pay-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const producto = btn.getAttribute('data-producto');
      const amount = parseFloat(btn.getAttribute('data-amount'));
      iniciarPagoFake(producto, amount);
    });
  });
}



// Evento para cerrar modal
document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('customModal').style.display = 'none';
});


// -------------------
// COLAPSAR LEYENDA
// -------------------

const legend = document.getElementById('legend');
const legendHeader = document.getElementById('legend-header');
const legendContent = document.getElementById('legend-content');

legendHeader.addEventListener('click', () => {
  if (legendContent.style.display === 'none') {
    legendContent.style.display = 'block';
  } else {
    legendContent.style.display = 'none';
  }
});


// -------------------
// INICIALIZACION MAPA Y MARCADORES
// -------------------

// Requiere que leaflet.js ya esté cargado antes

const map = L.map('map', { zoomControl: false }).setView([13.720195, -89.204076], 17);
L.control.zoom({ position: 'bottomright' }).addTo(map);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors, © CartoDB'
}).addTo(map);

function metrosPorPixelEnZoom(zoom, lat) {
  const earthCircumference = 40075000;
  const latRad = lat * Math.PI / 180;
  return earthCircumference * Math.cos(latRad) / (256 * Math.pow(2, zoom));
}

const categorias = {
  emprendedores: {
    color: '#3498db',
    radius: 10,
    archivo: 'emprendedores.json',
    layerGroup: L.layerGroup().addTo(map)
  },
  clientes: {
    color: '#e74c3c',
    radius: 10,
    archivo: 'clientes.json',
    layerGroup: L.layerGroup().addTo(map)
  },
  proveedores: {
    color: '#2ecc71',
    radius: 10,
    archivo: 'proveedores.json',
    layerGroup: L.layerGroup().addTo(map)
  },
  premium: {
    color: '#f1c40f',
    radius: 40,
    archivo: 'premium.json',
    layerGroup: L.layerGroup().addTo(map)
  }
};

// CONFIGURACION MARCADORES

Object.keys(categorias).forEach(cat => {
  const config = categorias[cat];
  fetch(config.archivo)
    .then(res => res.json())
    .then(puntos => {
      puntos.forEach(punto => {

        if (cat === 'premium') {
          const radiusMeters = config.radius || 50;
          let metersPerPixel = metrosPorPixelEnZoom(map.getZoom(), punto.lat);
          let iconSize = radiusMeters / metersPerPixel * 2;

          const createIcon = size => L.divIcon({
            className: 'icon-premium',
            html: `
              <svg width="${size}" height="${size}" viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                style="opacity:0.85;">
                <defs>
                  <clipPath id="circleView">
                    <circle cx="50" cy="50" r="48" />
                  </clipPath>
                </defs>
                <image xlink:href="${punto.icono}"
                  x="0" y="0" width="100" height="100"
                  preserveAspectRatio="xMidYMid slice"
                  clip-path="url(#circleView)"/>
                <circle cx="50" cy="50" r="48"
                  fill="none" stroke="${config.color}" stroke-width="4"/>
              </svg>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          let marker = L.marker([punto.lat, punto.lng], { icon: createIcon(iconSize) })
            .bindPopup(`
              <div style="display: flex; align-items: center;">
                <img src="${punto.perfil}" alt="Perfil" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 10px;">
                <div>
                  <h3 style="margin: 0; font-weight: 700; color: ${config.color};">${punto.producto}</h3>
                  <p style="margin: 2px 0 6px; font-weight: 500; font-size: 1.1em;">${punto.nombre}</p>
                  <p style="margin: 0; font-style: italic; color: #aaa;">Tipo: ${cat}</p><br>
                  <button onclick="openModal(
                  '${punto.nombre}', 
                  '${cat}', 
                  \`${punto.detalle}\`, 
                  '${punto.perfil}', 
                  '${punto.producto}', 
                  '${punto.facebook || ''}', 
                  '${punto.ig || ''}', 
                  '${punto.whatsapp || ''}', 
                  '${punto.linkedin || ''}'
                )">Maximizar</button>

                </div>
              </div>
            `)
            .addTo(config.layerGroup)
            .on('click', () => {
              map.setView([punto.lat, punto.lng], map.getZoom(), { animate: true });
            });

          config.markers = config.markers || [];
          config.markers.push({ marker, punto });

          map.on('zoom', () => {
            const metersPerPixelNow = metrosPorPixelEnZoom(map.getZoom(), punto.lat);
            const newSize = radiusMeters / metersPerPixelNow * 2;
            marker.setIcon(createIcon(newSize));
          });

        } else if (cat === 'clientes') {
          const radiusMeters = 10;
          let metersPerPixel = metrosPorPixelEnZoom(map.getZoom(), punto.lat);
          let iconSize = radiusMeters / metersPerPixel * 2;

          const createClienteIcon = size => L.divIcon({
            className: 'icon-cliente',
            html: `
              <svg width="${size}" height="${size}" viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                style="opacity:0.85;">
                <defs>
                  <clipPath id="circleViewCliente">
                    <circle cx="50" cy="50" r="48" />
                  </clipPath>
                </defs>
                <image xlink:href="${punto.icono}"
                  x="0" y="0" width="100" height="100"
                  preserveAspectRatio="xMidYMid slice"
                  clip-path="url(#circleViewCliente)"/>
                <circle cx="50" cy="50" r="48"
                  fill="none" stroke="red" stroke-width="4"/>
              </svg>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          let marker = L.marker([punto.lat, punto.lng], { icon: createClienteIcon(iconSize) })
            .bindPopup(`
            <div style="width: 250px;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="
                  width: 50px; height: 50px; border-radius: 50%;
                  overflow: hidden; border: 3px solid red; flex-shrink: 0; margin-right: 10px;">
                  <img src="${punto.perfil}" alt="Perfil" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <h3 style="margin: 0; color: red;">${punto.nombre}</h3>
              </div>
              <p style="font-style: italic; color: #555;">${punto.producto}</p>
              <div id="chatHistory" style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 5px; margin: 10px 0; font-size: 0.9em;"></div>
              <textarea id="chatInput" rows="2" style="width: 100%; resize: none;" placeholder="Escribe tu mensaje..."></textarea>
              <button id="sendChatBtn" style="margin-top: 5px; width: 100%; padding: 8px; background: red; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Enviar
              </button>
            </div>
          `)
            .addTo(config.layerGroup)

                //centrar en mapa

            .on('click', () => {
              map.setView([punto.lat, punto.lng], map.getZoom(), { animate: true });
            })

                // script fake chat

            .on("popupopen", function(e) {
              const popupNode = e.popup.getElement();
              const btn = popupNode.querySelector("#sendChatBtn");
              const input = popupNode.querySelector("#chatInput");
              const historyDiv = popupNode.querySelector("#chatHistory");

              const storageKey = `chat_${punto.nombre}`;

              let historial = JSON.parse(localStorage.getItem(storageKey)) || punto.mensajes || [];

              const palabrasProhibidas = ["droga", "marihuana", "cocaína", "sexo", "porno", "adulto", "violación", "arma", "cocaina", "explosivo", "terrorista"];

              function contieneProhibidas(mensaje) {
                const lower = mensaje.toLowerCase();
                return palabrasProhibidas.some(p => lower.includes(p));
              }

              function renderHistorial() {
                historyDiv.innerHTML = historial.map(m => `
                  <div style="display: flex; align-items: center; margin-bottom: 5px;">
                    <img src="${m.perfil}" alt="${m.usuario}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; margin-right: 8px;">
                    <div><strong>${m.usuario}:</strong> ${m.mensaje}</div>
                  </div>
                `).join('');
              }

              renderHistorial();

              btn.addEventListener("click", () => {
                const mensaje = input.value.trim();
                if (mensaje === "") return;

                // Validación palabras prohibidas personalizadas
                if (contieneProhibidas(mensaje)) {
                  alert("Tu mensaje contiene palabras prohibidas por la tienda.");
                  return;
                }

                // Validación con Purgomalum API
                fetch(`https://www.purgomalum.com/service/containsprofanity?text=${encodeURIComponent(mensaje)}`)
                  .then(res => res.text())
                  .then(isProfane => {
                    if (isProfane === "true") {
                      alert("Tu mensaje contiene lenguaje ofensivo. Corrígelo para enviarlo.");
                      return;
                    }

                    historial.push({
                      usuario: "Tú",
                      perfil: "/assets/productos/clientes/ninaliliam-anonas/nopfp.jpg", 
                      mensaje
                    });

                    localStorage.setItem(storageKey, JSON.stringify(historial));
                    renderHistorial();
                    input.value = "";
                  })
                  .catch(err => {
                    console.error("Error verificando mensaje:", err);
                    alert("No se pudo validar el mensaje. Intenta de nuevo.");
                  });
              });
            });

// Guarda el marcador para  buscador

          config.markers = config.markers || [];
          config.markers.push({ marker, punto });

          map.on('zoom', () => {
            const metersPerPixelNow = metrosPorPixelEnZoom(map.getZoom(), punto.lat);
            const newSize = radiusMeters / metersPerPixelNow * 2;
            marker.setIcon(createClienteIcon(newSize));
          });


        } else {
          // emprendedores y proveedores con círculo simple
          const circleMarker = L.circle([punto.lat, punto.lng], {
            color: config.color,
            fillColor: config.color,
            fillOpacity: 0.7,
            radius: config.radius
          })
          .bindPopup(`
            <div style="display: flex; align-items: center;">
              <img src="${punto.perfil}" alt="Perfil" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 10px;">
              <div>
                <h3 style="margin: 0; font-weight: 700; color: ${config.color};">${punto.producto}</h3>
                <p style="margin: 2px 0 6px; font-weight: 500; font-size: 1.1em;">${punto.nombre}</p>
                <p style="margin: 0; font-style: italic; color: #aaa;">Tipo: ${cat}</p><br>
                <button onclick="openModal(
                  '${punto.nombre}', 
                  '${cat}', 
                  \`${punto.detalle}\`, 
                  '${punto.perfil}', 
                  '${punto.producto}', 
                  '${punto.facebook || ''}', 
                  '${punto.ig || ''}', 
                  '${punto.whatsapp || ''}', 
                  '${punto.linkedin || ''}'
                )">Maximizar</button>

                </div>
            </div>
          `)
          .addTo(config.layerGroup)
          .on('click', () => {
            map.setView([punto.lat, punto.lng], map.getZoom(), { animate: true });
          });

          config.markers = config.markers || [];
          config.markers.push({ marker: circleMarker, punto });
        }
      });
    })
    .catch(err => console.error(`Error cargando ${cat}:`, err));
});


// -------------------
// LEYENDA FILTRADO CATEGORIAS
// -------------------

let activeCat = null;

const legendItems = document.querySelectorAll('#legend div[data-cat]');
legendItems.forEach(item => {
  item.addEventListener('click', () => {
    const cat = item.getAttribute('data-cat');

    if (cat === 'all') {
      showAll();
      activeCat = null;
      removeActiveClass();
    } else {
      if (activeCat === cat) {
        showAll();
        activeCat = null;
        removeActiveClass();
      } else {
        showOnly(cat);
        activeCat = cat;
        removeActiveClass();
        item.classList.add('active');
      }
    }
  });
});

function showAll() {
  Object.keys(categorias).forEach(c => {
    map.addLayer(categorias[c].layerGroup);
  });
}

function showOnly(cat) {
  Object.keys(categorias).forEach(c => {
    if (c === cat) {
      map.addLayer(categorias[c].layerGroup);
    } else {
      map.removeLayer(categorias[c].layerGroup);
    }
  });
}

function removeActiveClass() {
  legendItems.forEach(i => i.classList.remove('active'));
}


// -------------------
// FILTRAR MARCADORES POR TEXTO | Buscador
// -------------------

function filtrarMarcadores(texto) {
  texto = texto.trim().toLowerCase();

  if (texto === "") {
    Object.keys(categorias).forEach(cat => {
      const config = categorias[cat];
      if (!config.markers) return;

      config.markers.forEach(({ marker }) => {
        if (!map.hasLayer(marker)) map.addLayer(marker);
      });
    });
    return;
  }

  let algunoMostrado = false;

  Object.keys(categorias).forEach(cat => {
    const config = categorias[cat];
    if (!config.markers) return;

    config.markers.forEach(({ marker, punto }) => {
      const nombre = punto.nombre.toLowerCase();
      const producto = punto.producto.toLowerCase();

      const coincide = nombre.includes(texto) || producto.includes(texto);

      if (coincide) {
        if (!map.hasLayer(marker)) map.addLayer(marker);
        algunoMostrado = true;
      } else {
        if (map.hasLayer(marker)) map.removeLayer(marker);
      }
    });
  });

  if (!algunoMostrado) {
    alert("No se encontró ningún resultado para: " + texto);
  }
}

const inputBusqueda = document.getElementById('searchInput');
inputBusqueda.addEventListener('keyup', (e) => {
  if (e.key === "Enter") {
    filtrarMarcadores(inputBusqueda.value);
  }
});

//ESCUCHA VACÍO: restablece todo en tiempo real
inputBusqueda.addEventListener('input', (e) => {
  if (e.target.value.trim() === "") {
    filtrarMarcadores("");
  }
});


//SCRIPT BUSCADOR -->
//SCRIPT Fake Pay -->

function iniciarPagoFake(producto, monto) {
  // ✅ Mostrar popup PAGADO
  const pagadoPopup = document.createElement('div');
  pagadoPopup.style.position = 'fixed';
  pagadoPopup.style.top = '50%';
  pagadoPopup.style.left = '50%';
  pagadoPopup.style.transform = 'translate(-50%, -50%)';
  pagadoPopup.style.background = '#111';
  pagadoPopup.style.color = '#0f0';
  pagadoPopup.style.padding = '30px';
  pagadoPopup.style.fontSize = '1.5em';
  pagadoPopup.style.textAlign = 'center';
  pagadoPopup.style.borderRadius = '10px';
  pagadoPopup.style.zIndex = '9999';

  pagadoPopup.innerHTML = `
    ✅ Pago en proceso<br>
    <span style="font-size: 2em;">🔄</span>
  `;

  document.body.appendChild(pagadoPopup);

  // Espera 2s, luego mostrar info ciclista
  setTimeout(() => {
    document.body.removeChild(pagadoPopup);

    const ubicacion = prompt("✅ Gracias por tu compra 🚴‍♂️\nPor favor ingresa tu dirección o comparte tu ubicación GPS:");
    if (ubicacion) {
      // Fake coords y costo envío
      const latCliente = 13.72;
      const lngCliente = -89.2;
      const latEmprendedor = 13.70;
      const lngEmprendedor = -89.19;

      const distanciaKM = calcularDistancia(latCliente, lngCliente, latEmprendedor, lngEmprendedor);
      const costoEnvio = calcularComisionCiclista(distanciaKM);

      alert(
        `Un ciclista va en camino 🚴‍♂️\nDistancia: ${distanciaKM.toFixed(2)} km\nCosto estimado de envío: $${costoEnvio.toFixed(2)}`
      );

    } else {
      alert("⚠️ Necesitamos tu ubicación para coordinar la entrega.");
    }
  }, 2000);
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcularComisionCiclista(km) {
  return 0.50 + (km * 0.20);
}