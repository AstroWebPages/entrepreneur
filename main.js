//SCRIP COLAPSAR --



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






//SCRIP MAPA 


  
    const map = L.map('map').setView([13.720195, -89.201476], 17);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors, © CartoDB'
    }).addTo(map);

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


//MARCADORES

    // Cargar puntos
    Object.keys(categorias).forEach(cat => {
      const config = categorias[cat];
      fetch(config.archivo)
        .then(res => res.json())
        .then(puntos => {
          puntos.forEach(punto => {
            L.circle([punto.lat, punto.lng], {
              color: config.color,
              fillColor: config.color,
              fillOpacity: 0.7,
              radius: config.radius
            }).bindPopup(`<b>${punto.nombre}</b><br>Tipo: ${cat}`)
              .addTo(config.layerGroup);
          });
        })
        .catch(err => console.error(`Error cargando ${cat}:`, err));
    });


//Marcadores

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
            // Doble click → Mostrar todos
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
