<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import L from "leaflet";

const props = defineProps({
  tours: { type: Array, default: () => [] },
  activeId: { type: [String, Number], default: "" },
  single: { type: Boolean, default: false },
  groupOverlaps: { type: Boolean, default: false },
});

const emit = defineEmits(["select"]);
const mapElement = ref(null);
let map;
let markerLayer;

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

function renderMarkers() {
  if (!map) return;
  markerLayer.clearLayers();
  const bounds = [];

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
    } else {
      const tour = tours[0];
      marker = L.circleMarker(latLng, {
        radius: active ? 10 : 7,
        color: active ? "#a33a24" : "#ffffff",
        weight: active ? 4 : 2,
        fillColor: active ? "#d65337" : "#087f78",
        fillOpacity: 1,
      });
      marker.bindTooltip(tour.title, { direction: "top", offset: [0, -8] });
      marker.on("click", () => emit("select", tour));
    }

    marker.addTo(markerLayer);
    bounds.push(latLng);
  });

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

watch(() => [props.tours, props.activeId], renderMarkers, { deep: true });
onBeforeUnmount(() => map?.remove());
</script>

<template>
  <div ref="mapElement" class="tour-map" aria-label="관광지 위치 지도"></div>
</template>
