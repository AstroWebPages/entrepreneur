  // boton + y - mapa
  const map = L.map('map', { zoomControl: false }).setView([13.720195, -89.204076], 17);
  L.control.zoom({ position: 'bottomright' }).addTo(map);


  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, © CartoDB'
  }).addTo(map);

  // Función para calcular metros por pixel en el zoom actual y latitud dada
  function metrosPorPixelEnZoom(zoom, lat) {
    const earthCircumference = 40075000; // metros en el ecuador
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
