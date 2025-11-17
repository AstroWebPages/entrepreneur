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
              <div style="
  display: flex !important;
  align-items: center !important;
  padding: 12px !important;
  background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05)) !important;
  border-radius: 12px !important;
  box-shadow: 0 15px 25px rgba(0,0,0,0.2) !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  backdrop-filter: blur(12px) !important;
  max-width: 280px !important;
  transition: all 0.3s ease !important;
">
  <img src="${punto.perfil}" alt="Perfil" style="
    width: 40px !important;
    height: 40px !important;
    border-radius: 50% !important;
    object-fit: cover !important;
    margin-right: 10px !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
  ">
  <div style="flex: 1 !important;">
    <h3 style="
      margin: 0 !important;
      font-weight: 700 !important;
      color: ${config.color} !important;
      font-size: 16px !important;
    ">${punto.producto}</h3>
    
    <p style="
      margin: 2px 0 6px !important;
      font-weight: 500 !important;
      font-size: 14px !important;
    ">${punto.nombre}</p>
    
    <p style="
      margin: 0 !important;
      font-style: italic !important;
      color: #aaa !important;
      font-size: 12px !important;
    ">Tipo: ${cat}</p>
    
    <br>
    
    <button style="
      padding: 8px 14px !important;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
      color: #fff !important;
      border: none !important;
      border-radius: 8px !important;
      cursor: pointer !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      transition: all 0.2s ease !important;
      box-shadow: 0 2px 8px rgba(59,130,246,0.3) !important;
      width: 100% !important;
    "
    onmouseover="
      this.style.background='linear-gradient(135deg, #2563eb, #7c3aed)' !important;
      this.style.transform='translateY(-1px)' !important;
      this.style.boxShadow='0 4px 12px rgba(59,130,246,0.35)' !important;
    "
    onmouseout="
      this.style.background='linear-gradient(135deg, #3b82f6, #8b5cf6)' !important;
      this.style.transform='translateY(0)' !important;
      this.style.boxShadow='0 2px 8px rgba(59,130,246,0.3)' !important;
    "
    onclick="openModal(
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
            <div style="
  display: flex !important;
  align-items: center !important;
  padding: 12px !important;
  background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05)) !important;
  border-radius: 12px !important;
  box-shadow: 0 15px 25px rgba(0,0,0,0.2) !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  backdrop-filter: blur(12px) !important;
  max-width: 280px !important;
  transition: all 0.3s ease !important;
">
  <img src="${punto.perfil}" alt="Perfil" style="
    width: 40px !important;
    height: 40px !important;
    border-radius: 50% !important;
    object-fit: cover !important;
    margin-right: 10px !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
  ">
  <div style="flex: 1 !important;">
    <h3 style="
      margin: 0 !important;
      font-weight: 700 !important;
      color: ${config.color} !important;
      font-size: 16px !important;
    ">${punto.producto}</h3>
    
    <p style="
      margin: 2px 0 6px !important;
      font-weight: 500 !important;
      font-size: 14px !important;
    ">${punto.nombre}</p>
    
    <p style="
      margin: 0 !important;
      font-style: italic !important;
      color: #aaa !important;
      font-size: 12px !important;
    ">Tipo: ${cat}</p>
    
    <br>
    
    <button style="
      padding: 8px 14px !important;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
      color: #fff !important;
      border: none !important;
      border-radius: 8px !important;
      cursor: pointer !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      transition: all 0.2s ease !important;
      box-shadow: 0 2px 8px rgba(59,130,246,0.3) !important;
      width: 100% !important;
    "
    onmouseover="
      this.style.background='linear-gradient(135deg, #2563eb, #7c3aed)' !important;
      this.style.transform='translateY(-1px)' !important;
      this.style.boxShadow='0 4px 12px rgba(59,130,246,0.35)' !important;
    "
    onmouseout="
      this.style.background='linear-gradient(135deg, #3b82f6, #8b5cf6)' !important;
      this.style.transform='translateY(0)' !important;
      this.style.boxShadow='0 2px 8px rgba(59,130,246,0.3)' !important;
    "
    onclick="openModal(
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


let lastLat = null;
let lastLng = null;

// CLICK MAPA - BETA
// Evento click en el mapa (área vacía)
map.on('click', function(e) {
  
  const lat = e.latlng.lat.toFixed(6);
  const lng = e.latlng.lng.toFixed(6);

  const contenido = `
    <div style="
      text-align: center;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      max-width: 280px;
      border: 1px solid rgba(59, 130, 246, 0.1);
      position: relative;
      backdrop-filter: blur(10px);
    ">
      <div style="
        width: 12px;
        height: 12px;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        border-radius: 50%;
        position: absolute;
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      "></div>
      
      <h3 style="
        margin: 4px 0 12px 0;
        color: #1f2937;
        font-size: 17px;
        font-weight: 600;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      ">¿Agregar emprendimiento?</h3>
      
      <div style="
        background: rgba(59, 130, 246, 0.05);
        border-radius: 8px;
        padding: 8px;
        margin: 0 0 16px 0;
        border-left: 3px solid #3b82f6;
      ">
        <p style="
          margin: 0;
          color: #6b7280;
          font-size: 12px;
          font-family: 'SF Mono', monospace;
        ">📍 ${lat} | ${lng}</p>
      </div>
      
      <button id="agregarEmprendimientoBtn" data-lat="${lat}"
        data-lng="${lng}" style="
        padding: 10px 18px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        width: 100%;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
        position: relative;
        overflow: hidden;
      " 
      onmouseover="
        this.style.background='linear-gradient(135deg, #059669, #047857)';
        this.style.transform='translateY(-1px)';
        this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.3)';
      "
      onmouseout="
        this.style.background='linear-gradient(135deg, #10b981, #059669)';
        this.style.transform='translateY(0)';
        this.style.boxShadow='0 2px 8px rgba(16, 185, 129, 0.2)';
      ">
        ✅ Sí, agregar aquí
      </button>

      <!-- ALERTA PROXIMAMENTE CLIENTE / PROVEEDOR -->

      <a href="#" onclick="alert('Contacta astrowebpages@gmail.com para mas información (Suscripción próximamente)');"
   style="display:block; margin-top:8px; text-align:center; font-size:13px; color:#059669; text-decoration:underline; cursor:pointer;">
    Soy proveedor / cliente
</a>



    </div>
  `;
  L.popup()
    .setLatLng(e.latlng)
    .setContent(contenido)
    .openOn(map);




  document.addEventListener('click', function (e) {
  if (e.target && e.target.id === "agregarEmprendimientoBtn") {
    abrirFormularioEmprendimiento(
      e.target.getAttribute("data-lat"),
      e.target.getAttribute("data-lng")
    );
    map.closePopup();
  }
});

});

//TOMAR LONGITUD 

// Función abrir formulario emprendimiento
function abrirFormularioEmprendimiento(lat, lng) {
  const modal = document.getElementById('formularioModal');
  modal.style.display = 'flex';
  document.getElementById('latInput').value = lat;
  document.getElementById('lngInput').value = lng;
}


document.getElementById('closeFormularioModal').addEventListener('click', function() {
  document.getElementById('formularioModal').style.display = 'none';
});

// Botón agregar producto extra
const container = document.getElementById('productosContainer');
const agregarBtn = document.getElementById('agregarProductoBtn');
let contadorProductos = 1;

// Modal de pago premium (puedes modificar este contenido después)
const modalPagoHTML = `
<div id="modalPago" style="
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 5000;
  justify-content: center;
  align-items: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
">
  <div style="
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px;
    border-radius: 20px;
    max-width: 90%;
    max-height: 90%;
    position: relative;
    text-align: center;
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    transform: scale(0.9) translateY(20px);
    transition: all 0.3s ease;
  ">
    <button id="closePagoModal" style="
      position: absolute;
      top: 15px; right: 15px;
      background: rgba(255, 255, 255, 0.2);
      border: none; color: white;
      width: 36px; height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'"
       onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">×</button>
    
    <div style="margin-bottom: 30px;">
      <div style="
        width: 80px; height: 80px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        margin: 0 auto 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
      ">🚀</div>
      
      <h2 style="
        margin: 0 0 16px 0;
        font-size: 28px;
        font-weight: 700;
      ">¡Desbloquea el Plan Premium!</h2>
      
      <p style="
        font-size: 18px;
        opacity: 0.9;
        line-height: 1.5;
        margin-bottom: 30px;
      ">Agrega productos ilimitados y accede a funciones exclusivas para hacer crecer tu emprendimiento</p>
    </div>
    
    <div style="
      background: rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 30px;
      text-align: left;
    ">
      <h3 style="margin: 0 0 15px 0; color: #fff;">✨ Beneficios Premium:</h3>
      <ul style="
        list-style: none;
        padding: 0;
        margin: 0;
      ">
        <li style="padding: 8px 0; font-size: 16px;">🛍️ Productos ilimitados</li>
        <li style="padding: 8px 0; font-size: 16px;">📊 Analytics avanzados</li>
        <li style="padding: 8px 0; font-size: 16px;">🎨 Personalización completa</li>
        <li style="padding: 8px 0; font-size: 16px;">💬 Soporte prioritario</li>
        <li style="padding: 8px 0; font-size: 16px;">🔥 Sin publicidad</li>
      </ul>
    </div>
    
    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
      <button id="btnUpgrade" style="
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 8px 20px rgba(240, 147, 251, 0.3);
      " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 25px rgba(240, 147, 251, 0.4)'"
         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px rgba(240, 147, 251, 0.3)'">
        🚀 Actualizar a Premium
      </button>
      
      <button id="btnContinueBasic" style="
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.3);
        padding: 13px 25px;
        border-radius: 25px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
      " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'"
         onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
        Continuar con Plan Básico
      </button>
    </div>
    
    <p style="
      margin-top: 20px;
      font-size: 14px;
      opacity: 0.7;
    ">* Puedes cancelar en cualquier momento</p>
  </div>
</div>`;

// Agregar modal de pago al DOM si no existe
if (!document.getElementById('modalPago')) {
  document.body.insertAdjacentHTML('beforeend', modalPagoHTML);
}

// Función para mostrar modal de pago
function mostrarModalPago() {
  const modalPago = document.getElementById('modalPago');
  modalPago.style.display = 'flex';
  
  // Animación de entrada
  setTimeout(() => {
    modalPago.style.opacity = '1';
    modalPago.style.visibility = 'visible';
    modalPago.querySelector('div').style.transform = 'scale(1) translateY(0)';
  }, 10);
}

// Función para cerrar modal de pago
function cerrarModalPago() {
  const modalPago = document.getElementById('modalPago');
  modalPago.style.opacity = '0';
  modalPago.style.visibility = 'hidden';
  modalPago.querySelector('div').style.transform = 'scale(0.9) translateY(20px)';
  
  setTimeout(() => {
    modalPago.style.display = 'none';
  }, 300);
}

// Event listeners para modal de pago
document.addEventListener('click', function(e) {
  if (e.target.id === 'closePagoModal' || e.target.id === 'btnContinueBasic') {
    cerrarModalPago();
  }
  
  if (e.target.id === 'btnUpgrade') {
    // AQUÍ PUEDES AGREGAR TU LÓGICA DE PAGO
    alert('Contacta astrowebpages@gmail.com para realizar tu compra ahora (Suscripción Próximamente) ');
    cerrarModalPago();
  }
});

// Función principal para agregar productos
agregarBtn.addEventListener('click', function() {
  // Si ya tiene 5 productos, mostrar modal de pago
  if (contadorProductos >= 4) {
    mostrarModalPago();
    return;
  }

  contadorProductos++;
  
  // Crear nuevo producto con estilos compatibles
  const nuevoProducto = document.createElement('div');
  nuevoProducto.className = 'producto-item';
  nuevoProducto.style.cssText = `
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    margin-bottom: 16px;
  `;
  
  nuevoProducto.innerHTML = `
    <h3 style="
      margin: 0 0 16px 0;
      color: #1f2937;
      font-size: 16px;
      font-weight: 600;
      padding: 8px 0;
      border-bottom: 2px solid #e5e7eb;
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">Producto ${contadorProductos}
      <span style="
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 40px;
        height: 2px;
        background: linear-gradient(90deg, #8b5cf6, #a855f7);
      "></span>
    </h3>
    
    <label>Link producto externo (opcional):<br>
      <input type="url" name="producto${contadorProductos}_link">
    </label>
    
    <label>Precio:<br>
      <input type="number" step="0.01" name="producto${contadorProductos}_precio" required>
    </label>
    
    <label>Link imagen:<br>
      <input type="url" name="producto${contadorProductos}_imagen" required>
    </label>
    
    <label>Título:<br>
      <input type="text" name="producto${contadorProductos}_titulo" required>
    </label>
    
    <label>Descripción:<br>
      <textarea name="producto${contadorProductos}_descripcion" rows="3" required></textarea>
    </label>
    
    <button type="button" class="eliminar-producto" data-producto="${contadorProductos}" style="
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      margin-top: 12px;
      transition: all 0.2s ease;
    " onmouseover="this.style.background='linear-gradient(135deg, #dc2626, #b91c1c)'"
       onmouseout="this.style.background='linear-gradient(135deg, #ef4444, #dc2626)'">
      🗑️ Eliminar Producto
    </button>
  `;

  container.appendChild(nuevoProducto);
  
  // Actualizar texto del botón
  if (contadorProductos === 3) {
    this.innerHTML = '➕ Agregar último producto gratuito';
    this.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
  } else if (contadorProductos === 4) {
    this.innerHTML = '🚀 Desbloquear más productos (Premium)';
    this.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
  }
  
  // Animar entrada del nuevo producto
  nuevoProducto.style.opacity = '0';
  nuevoProducto.style.transform = 'translateY(20px)';
  setTimeout(() => {
    nuevoProducto.style.transition = 'all 0.3s ease';
    nuevoProducto.style.opacity = '1';
    nuevoProducto.style.transform = 'translateY(0)';
  }, 10);
});

// Función para eliminar productos
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('eliminar-producto')) {
    const productoNumero = parseInt(e.target.dataset.producto);
    const productoElement = e.target.closest('.producto-item');
    
    // Animación de salida
    productoElement.style.transition = 'all 0.3s ease';
    productoElement.style.opacity = '0';
    productoElement.style.transform = 'translateX(-100px)';
    
    setTimeout(() => {
      productoElement.remove();
      contadorProductos--;
      
      // Actualizar botón si es necesario
      if (contadorProductos < 4) {
        agregarBtn.disabled = false;
        if (contadorProductos === 3) {
          agregarBtn.innerHTML = '➕ Agregar último producto gratuito';
          agregarBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        } else {
          agregarBtn.innerHTML = '➕ Agregar otro producto';
          agregarBtn.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
        }
      }
      
      // Reordenar números de productos
      actualizarNumerosProductos();
    }, 300);
  }
});

// Función para actualizar números de productos después de eliminar
function actualizarNumerosProductos() {
  const productos = container.querySelectorAll('.producto-item');
  productos.forEach((producto, index) => {
    const numero = index + 1;
    const h3 = producto.querySelector('h3');
    if (h3) {
      h3.innerHTML = `Producto ${numero}
        <span style="
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, #8b5cf6, #a855f7);
        "></span>`;
    }
    
    // Actualizar nombres de los inputs
    const inputs = producto.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      const currentName = input.getAttribute('name');
      if (currentName) {
        const newName = currentName.replace(/producto\d+_/, `producto${numero}_`);
        input.setAttribute('name', newName);
      }
    });
    
    // Actualizar botón eliminar
    const btnEliminar = producto.querySelector('.eliminar-producto');
    if (btnEliminar) {
      btnEliminar.dataset.producto = numero;
    }
  });
}