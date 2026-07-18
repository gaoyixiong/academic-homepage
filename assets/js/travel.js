(() => {
  const onReady = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  onReady(() => {
    const root = document.querySelector('[data-travel-root]');
    if (!root) return;

    const dataElement = document.getElementById('travel-map-data');
    let places = [];
    try {
      places = JSON.parse(dataElement?.textContent || '[]');
    } catch (error) {
      console.error('Could not read travel map data.', error);
    }

    const dialog = root.querySelector('[data-travel-dialog]');
    const dialogContent = root.querySelector('[data-travel-dialog-content]');
    let activePlaceID = null;
    let map = null;
    let mapLoaded = false;
    let currentFilter = 'all';

    const removePlaceHash = () => {
      if (!window.location.hash.startsWith('#place-')) return;
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    };

    const closeDialog = () => {
      if (!dialog) return;
      if (typeof dialog.close === 'function' && dialog.open) dialog.close();
      else dialog.removeAttribute('open');
      document.documentElement.classList.remove('travel-dialog-open');
      removePlaceHash();
      activePlaceID = null;
    };

    const openPlace = (id) => {
      const template = document.getElementById(`travel-template-${id}`);
      if (!template || !dialog || !dialogContent) return;

      dialogContent.replaceChildren(template.content.cloneNode(true));
      dialogContent.scrollTop = 0;
      activePlaceID = id;
      window.history.replaceState(null, '', `#place-${id}`);
      document.documentElement.classList.add('travel-dialog-open');

      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }

      dialog.querySelector('.travel-dialog-close')?.focus({ preventScroll: true });
    };

    root.querySelectorAll('[data-travel-open]').forEach((button) => {
      button.addEventListener('click', () => openPlace(button.dataset.travelOpen));
    });

    dialog?.addEventListener('close', () => {
      document.documentElement.classList.remove('travel-dialog-open');
      removePlaceHash();
      activePlaceID = null;
    });

    dialog?.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog();
    });

    const matchesFilter = (place, filter) => {
      if (filter === 'visited') return Boolean(place.visited);
      if (filter === 'planned') return Boolean(place.planned);
      return true;
    };

    const featureCollection = (filter) => ({
      type: 'FeatureCollection',
      features: places.filter((place) => matchesFilter(place, filter)).map((place) => ({
        type: 'Feature',
        properties: {
          id: place.id,
          title: place.title,
          path: place.path,
          visited: Boolean(place.visited),
          planned: Boolean(place.planned),
        },
        geometry: {
          type: 'Point',
          coordinates: [Number(place.lon), Number(place.lat)],
        },
      })),
    });

    const updateFilter = (filter) => {
      currentFilter = filter;
      root.querySelectorAll('[data-travel-filter]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.travelFilter === filter));
      });

      const visibleCount = places.filter((place) => matchesFilter(place, filter)).length;
      const emptyState = root.querySelector('[data-travel-filter-empty]');
      if (emptyState) emptyState.hidden = visibleCount !== 0;

      if (mapLoaded) {
        map.getSource('travel-places')?.setData(featureCollection(filter));
      }
    };

    root.querySelectorAll('[data-travel-filter]').forEach((button) => {
      button.addEventListener('click', () => updateFilter(button.dataset.travelFilter));
    });

    const mapElement = document.getElementById('travel-map');
    const showMapFallback = () => {
      if (!mapElement || mapLoaded) return;
      mapElement.classList.add('travel-map-unavailable');
      mapElement.innerHTML = '<div><strong>The interactive map is unavailable.</strong><span>All destinations remain available in the regional archive below.</span></div>';
    };

    const hideAdministrativeLayers = () => {
      const layers = map?.getStyle()?.layers || [];
      layers.forEach((layer) => {
        const sourceLayer = layer['source-layer'] || '';
        const searchable = `${layer.id} ${sourceLayer}`.toLowerCase();
        const isBoundary = /boundary|admin/.test(searchable);
        const isPoliticalLabel = layer.type === 'symbol' && /country|state/.test(searchable);
        if (isBoundary || isPoliticalLabel) {
          try {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          } catch (_) {
            // Some style layers do not expose a configurable layout.
          }
        }
      });
    };

    const initialiseMap = () => {
      if (!mapElement || !places.length || !window.maplibregl) {
        showMapFallback();
        return;
      }

      try {
        map = new window.maplibregl.Map({
          container: mapElement,
          style: 'https://tiles.openfreemap.org/styles/positron',
          center: [48, 25],
          zoom: window.matchMedia('(max-width: 640px)').matches ? 0.45 : 1.05,
          minZoom: 0.25,
          maxZoom: 14,
          cooperativeGestures: true,
          attributionControl: true,
        });

        map.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), 'top-right');

        map.on('load', () => {
          mapLoaded = true;
          hideAdministrativeLayers();

          map.addSource('travel-places', {
            type: 'geojson',
            data: featureCollection(currentFilter),
            cluster: true,
            clusterMaxZoom: 7,
            clusterRadius: 42,
          });

          map.addLayer({
            id: 'travel-clusters',
            type: 'circle',
            source: 'travel-places',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#2563eb',
              'circle-radius': ['step', ['get', 'point_count'], 18, 8, 22, 20, 27],
              'circle-stroke-color': 'rgba(255,255,255,0.94)',
              'circle-stroke-width': 3,
              'circle-opacity': 0.92,
            },
          });

          map.addLayer({
            id: 'travel-cluster-count',
            type: 'symbol',
            source: 'travel-places',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': ['get', 'point_count_abbreviated'],
              'text-size': 12,
            },
            paint: { 'text-color': '#ffffff' },
          });

          map.addLayer({
            id: 'travel-points',
            type: 'circle',
            source: 'travel-places',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 5.5, 8, 8.5],
              'circle-color': ['case', ['boolean', ['get', 'visited'], false], '#2563eb', '#ffffff'],
              'circle-stroke-color': ['case', ['boolean', ['get', 'planned'], false], '#f59e0b', '#ffffff'],
              'circle-stroke-width': ['case', ['boolean', ['get', 'planned'], false], 3, 2],
              'circle-opacity': 0.96,
            },
          });

          map.on('click', 'travel-clusters', (event) => {
            const coordinates = event.features?.[0]?.geometry?.coordinates;
            if (!coordinates) return;
            map.easeTo({ center: coordinates, zoom: Math.min(map.getZoom() + 2.2, 10) });
          });

          map.on('click', 'travel-points', (event) => {
            const id = event.features?.[0]?.properties?.id;
            if (id) openPlace(id);
          });

          const popup = new window.maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 });
          map.on('mouseenter', 'travel-points', (event) => {
            map.getCanvas().style.cursor = 'pointer';
            const feature = event.features?.[0];
            if (!feature) return;
            const popupContent = document.createElement('div');
            popupContent.className = 'travel-map-popup';
            const popupTitle = document.createElement('strong');
            const popupPath = document.createElement('span');
            popupTitle.textContent = feature.properties.title;
            popupPath.textContent = feature.properties.path;
            popupContent.append(popupTitle, popupPath);
            popup
              .setLngLat(feature.geometry.coordinates)
              .setDOMContent(popupContent)
              .addTo(map);
          });
          map.on('mouseleave', 'travel-points', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
          });
          map.on('mouseenter', 'travel-clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
          map.on('mouseleave', 'travel-clusters', () => { map.getCanvas().style.cursor = ''; });
        });

        window.setTimeout(showMapFallback, 12000);
      } catch (error) {
        console.error('Could not initialise the travel map.', error);
        showMapFallback();
      }
    };

    updateFilter('all');
    initialiseMap();

    const initialHash = window.location.hash.match(/^#place-([a-z0-9-]+)$/);
    if (initialHash) openPlace(initialHash[1]);
  });
})();
