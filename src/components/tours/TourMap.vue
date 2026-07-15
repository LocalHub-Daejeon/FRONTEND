<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import L from "leaflet";
import "leaflet-routing-machine"; 

const props = defineProps({
  tours: { type: Array, default: () => [] },
  activeId: { type: [String, Number], default: "" },
  single: { type: Boolean, default: false },
  groupOverlaps: { type: Boolean, default: false },
  drawPath: { type: Boolean, default: false },
});

const emit = defineEmits(["select"]);
const mapElement = ref(null);
let map;
let markerLayer;
let routingControl = null;

function validTours() {
  return props.tours.filter((tour) => Number(tour.mapx) && Number(tour.mapy));
}

function markerGroups() {
  if (!props.groupOverlaps) {
    return validTours().map((tour) => ({
      latLng: [Number(tour.mapy), Number(tour.mapx)],
      tours: [tour],
    }));
  }

  const groups = new Map();
  validTours().forEach((tour) => {
    const key = `${tour.mapy},${tour.mapx}`;
    if (!groups.has(key)) {
      groups.set(key, { latLng: [Number(tour.mapy), Number(tour.mapx)], tours: [] });
    }
    groups.get(key).tours.push(tour);
  });
  return [...groups.values()];
}

function groupedPopup(tours) {
  const popup = document.createElement("div");
  popup.className = "course-marker-popup";
  const heading = document.createElement("strong");
  heading.textContent = `이 위치의 여행코스 ${tours.length}개`;
  popup.appendChild(heading);

  tours.forEach((tour) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = tour.title;
    button.addEventListener("click", () => {
      emit("select", tour);
      map.closePopup();
    });
    popup.appendChild(button);
  });
  return popup;
}

function createHoverTooltip(tour) {
  const imgUrl = tour.firstimage || tour.firstimage2;
  return `
    <div class="map-hover-preview">
      ${imgUrl ? `<img src="${imgUrl}" alt="${tour.title}" />` : `<div class="no-img"><span>사진 없음</span></div>`}
      <strong>${tour.title}</strong>
    </div>
  `;
}

function renderMarkers() {
  if (!map) return;
  markerLayer.clearLayers();
  const bounds = [];
  const pathCoordinates = [];

  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }

  if (props.drawPath) {
    validTours().forEach((tour) => {
      pathCoordinates.push([Number(tour.mapy), Number(tour.mapx)]);
    });
  }

  markerGroups().forEach(({ latLng, tours }) => {
    const active = tours.some((tour) => String(tour.contentid) === String(props.activeId));
    let marker;

    if (tours.length > 1) {
      marker = L.marker(latLng, {
        icon: L.divIcon({
          className: "course-marker-icon-wrap",
          html: `<span class="course-marker-icon${active ? " active" : ""}">${tours.length}</span>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        }),
      });
      marker.bindPopup(groupedPopup(tours), { minWidth: 220, maxWidth: 300 });
      
      marker.bindTooltip(`
        <div class="map-hover-preview grouped">
          <strong>${tours.length}개의 장소</strong>
          <small>클릭해서 목록을 확인하세요</small>
        </div>
      `, { direction: "top", offset: [0, -22], className: "custom-preview-tooltip", opacity: 1 });
      
    } else {
      const tour = tours[0];
      marker = L.circleMarker(latLng, {
        radius: active ? 10 : 7,
        color: active ? "#a33a24" : "#ffffff",
        weight: active ? 4 : 2,
        fillColor: active ? "#d65337" : "#087f78",
        fillOpacity: 1,
      });
      
      marker.bindTooltip(createHoverTooltip(tour), { 
        direction: "top", 
        offset: [0, -12], 
        className: "custom-preview-tooltip",
        opacity: 1 
      });
      
      marker.on("click", () => emit("select", tour));
    }

    marker.addTo(markerLayer);
    bounds.push(latLng);
  });

  if (props.drawPath && pathCoordinates.length > 1) {
    routingControl = L.Routing.control({
      waypoints: pathCoordinates.map(coord => L.latLng(coord[0], coord[1])),
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      lineOptions: {
        styles: [{ color: '#087f78', weight: 5, opacity: 0.8 }]
      },
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      showAlternatives: false,
      createMarker: () => null // 👈 라우팅 기본 마커 생성을 차단하여 툴팁 호버가 정상 작동하게 합니다.
    }).addTo(map);
  }

  if (bounds.length === 1) map.setView(bounds[0], props.single ? 14 : 12);
  if (bounds.length > 1) map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
  if (!bounds.length) map.setView([36.35, 127.38], 8);
}

onMounted(async () => {
  await nextTick();
  map = L.map(mapElement.value, { zoomControl: false, scrollWheelZoom: false });
  L.control.zoom({ position: "bottomright" }).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
  renderMarkers();
});

watch(() => [props.tours, props.activeId, props.drawPath], renderMarkers, { deep: true });
onBeforeUnmount(() => map?.remove());
</script>

<template>
  <div ref="mapElement" class="tour-map" aria-label="관광지 위치 지도"></div>
</template>

<style scoped>
:deep(.leaflet-routing-container) {
  display: none !important;
}

:deep(.leaflet-tooltip.custom-preview-tooltip) {
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: 0 12px 28px rgba(23, 32, 28, 0.15);
  overflow: hidden;
}

:deep(.leaflet-tooltip.custom-preview-tooltip::before) {
  display: none;
}

:deep(.map-hover-preview) {
  width: 160px;
  display: flex;
  flex-direction: column;
}

:deep(.map-hover-preview img),
:deep(.map-hover-preview .no-img) {
  width: 100%;
  height: 96px;
  object-fit: cover;
  display: block;
}

:deep(.map-hover-preview .no-img) {
  background: var(--surface-alt);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  font-size: 11px;
}

:deep(.map-hover-preview strong) {
  padding: 10px;
  font-size: 13px;
  color: var(--ink);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.map-hover-preview.grouped) {
  width: auto;
  padding: 12px 16px;
}

:deep(.map-hover-preview.grouped strong) {
  padding: 0;
  margin-bottom: 4px;
  display: block;
}

:deep(.map-hover-preview.grouped small) {
  color: var(--muted);
  font-size: 11px;
  font-weight: 500;
}
</style>