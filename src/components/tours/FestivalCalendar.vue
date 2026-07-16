<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import koLocale from "@fullcalendar/core/locales/ko";
import { CalendarDays, MapPin, Phone } from "@lucide/vue";
import AppModal from "../common/AppModal.vue";
import { fallbackImage, onImageError } from "../../utils/format";

const { t, locale } = useI18n();

const props = defineProps({
  festivals: { type: Array, default: () => [] },
});

const regionOptionValues = ["", "3", "8", "33", "34"];
const regionOptions = computed(() =>
  regionOptionValues.map((value) => ({
    value,
    label: t(`festivalCalendar.regions.${value || "all"}`),
  })),
);
const selectedRegion = ref("");
const selectedFestival = ref(null);

function normalizeDate(value) {
  const text = String(value || "").trim();
  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  return "";
}

function addOneDay(value) {
  const normalized = normalizeDate(value);
  if (!normalized) return "";
  const [year, month, day] = normalized.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + 1));
  return date.toISOString().slice(0, 10);
}

function inferAreaCode(address) {
  const value = String(address || "").trim();
  if (value.startsWith("대전")) return "3";
  if (value.startsWith("세종")) return "8";
  if (value.startsWith("충청북도") || value.startsWith("충북")) return "33";
  if (value.startsWith("충청남도") || value.startsWith("충남")) return "34";
  return "";
}

function formatDisplayDate(value) {
  const normalized = normalizeDate(value);
  if (!normalized) return t("festivalCalendar.dateUnknown");
  const [year, month, day] = normalized.split("-");
  return `${year}.${month}.${day}`;
}

function regionLabelFor(areaCode) {
  return regionOptionValues.includes(areaCode)
    ? t(`festivalCalendar.regions.${areaCode || "all"}`)
    : t("festivalCalendar.regions.unclassified");
}

function regionShortLabelFor(areaCode) {
  return t(`festivalCalendar.regionShort.${areaCode || "other"}`);
}

const normalizedFestivals = computed(() =>
  props.festivals.map((festival) => {
    const sourceProps = festival.extendedProps || {};
    const start = normalizeDate(festival.eventstartdate || festival.start);
    const inclusiveEnd = normalizeDate(festival.eventenddate);
    const endExclusive = inclusiveEnd
      ? addOneDay(inclusiveEnd)
      : normalizeDate(festival.end) || (start ? addOneDay(start) : "");
    const addr1 = festival.addr1 || sourceProps.addr1 || "";
    const areaCode = String(
      festival.areacode || sourceProps.areacode || inferAreaCode(addr1),
    );

    return {
      ...festival,
      addr1,
      addr2: festival.addr2 || sourceProps.addr2 || "",
      firstimage: festival.firstimage || sourceProps.firstimage || "",
      tel: festival.tel || sourceProps.tel || "",
      eventplace: festival.eventplace || sourceProps.eventplace || "",
      areaCode,
      regionName: regionLabelFor(areaCode),
      regionShortName: regionShortLabelFor(areaCode),
      start,
      inclusiveEnd: inclusiveEnd || start,
      endExclusive,
      hasSchedule: Boolean(start),
    };
  }),
);

const filteredFestivals = computed(() =>
  normalizedFestivals.value.filter(
    (festival) => !selectedRegion.value || festival.areaCode === selectedRegion.value,
  ),
);

const scheduledFestivals = computed(() =>
  filteredFestivals.value.filter((festival) => festival.hasSchedule),
);
const unscheduledFestivals = computed(() =>
  filteredFestivals.value.filter((festival) => !festival.hasSchedule),
);

const activeRegionCodes = computed(() =>
  regionOptionValues.filter(
    (value) => value && normalizedFestivals.value.some((festival) => festival.areaCode === value),
  ),
);

const visibleRegionOptions = computed(() => {
  if (activeRegionCodes.value.length < 2) return [];

  return regionOptions.value.filter(
    (option) => !option.value || activeRegionCodes.value.includes(option.value),
  );
});

const calendarEvents = computed(() =>
  scheduledFestivals.value.map((festival) => ({
    id: String(festival.contentid),
    title: `[${festival.regionShortName}] ${festival.title}`,
    start: festival.start,
    end: festival.endExclusive,
    allDay: true,
    classNames: [`festival-event-region-${festival.areaCode || "other"}`],
    extendedProps: { festival },
  })),
);

function regionCount(value) {
  return normalizedFestivals.value.filter(
    (festival) => !value || festival.areaCode === value,
  ).length;
}

function openFestival(eventInfo) {
  selectedFestival.value = eventInfo.event.extendedProps.festival;
}

function festivalDateRange(festival) {
  if (!festival?.start) return t("festivalCalendar.dateUnknown");
  const start = formatDisplayDate(festival.start);
  const end = formatDisplayDate(festival.inclusiveEnd);
  return start === end ? start : `${start} ~ ${end}`;
}

function localizedCalendarSettings() {
  return {
    locale: locale.value === "ko" ? koLocale : undefined,
    buttonText: { today: t("festivalCalendar.todayButton") },
    moreLinkText: (count) => t("festivalCalendar.moreLinkText", { count }),
  };
}

const calendarOptions = reactive({
  plugins: [dayGridPlugin],
  ...localizedCalendarSettings(),
  initialView: "dayGridMonth",
  initialDate: calendarEvents.value[0]?.start,
  headerToolbar: {
    left: "today",
    center: "prev title next",
    right: "",
  },
  displayEventTime: false,
  fixedWeekCount: false,
  dayMaxEvents: 3,
  events: calendarEvents.value,
  eventClick: openFestival,
});

watch(calendarEvents, (events) => {
  calendarOptions.events = events;
});

watch(activeRegionCodes, (regionCodes) => {
  if (selectedRegion.value && !regionCodes.includes(selectedRegion.value)) {
    selectedRegion.value = "";
  }
});

watch(locale, () => {
  Object.assign(calendarOptions, localizedCalendarSettings());
});
</script>

<template>
  <section class="festival-calendar-shell">
    <div
      v-if="visibleRegionOptions.length"
      class="festival-region-filter-toolbar"
      :aria-label="t('festivalCalendar.regionFilterAriaLabel')"
    >
      <div class="festival-region-filter">
        <button
          v-for="option in visibleRegionOptions"
          :key="option.value"
          type="button"
          :class="[
            'region-filter-option',
            option.value ? `region-color-${option.value}` : 'region-color-all',
            { active: selectedRegion === option.value },
          ]"
          @click="selectedRegion = option.value"
        >
          <span v-if="option.value" class="region-color-dot" aria-hidden="true"></span>
          {{ option.label }} <small>{{ regionCount(option.value) }}</small>
        </button>
      </div>
    </div>

    <div class="festival-calendar-summary">
      <div class="festival-calendar-counts">
        <span><CalendarDays :size="16" /> {{ t("festivalCalendar.scheduledCount", { count: scheduledFestivals.length }) }}</span>
        <span v-if="unscheduledFestivals.length">{{ t("festivalCalendar.unscheduledCount", { count: unscheduledFestivals.length }) }}</span>
      </div>
    </div>

    <div class="festival-calendar-wrap">
      <FullCalendar :options="calendarOptions" />
    </div>

    <section v-if="unscheduledFestivals.length" class="unscheduled-festivals">
      <div class="unscheduled-heading">
        <div>
          <p class="section-kicker">{{ t("festivalCalendar.datePendingEyebrow") }}</p>
          <h3>{{ t("festivalCalendar.unscheduledHeading") }}</h3>
        </div>
        <span>{{ unscheduledFestivals.length }}{{ t("festivalCalendar.unscheduledUnit") }}</span>
      </div>
      <div class="unscheduled-festival-list">
        <RouterLink
          v-for="festival in unscheduledFestivals"
          :key="festival.contentid"
          :to="`/tours/${festival.contentid}`"
        >
          <strong>{{ festival.title }}</strong>
          <small><MapPin :size="13" /> {{ festival.regionName }} · {{ festival.addr1 || t("tours.addressUnknown") }}</small>
        </RouterLink>
      </div>
    </section>

    <AppModal
      v-if="selectedFestival"
      :title="selectedFestival.title"
      :description="festivalDateRange(selectedFestival)"
      wide
      @close="selectedFestival = null"
    >
      <div class="festival-detail-modal">
        <img
          :src="selectedFestival.firstimage || fallbackImage"
          :alt="t('festivalCalendar.photoAlt', { title: selectedFestival.title })"
          @error="onImageError"
        />
        <div class="festival-detail-info">
          <span class="festival-region-badge">{{ selectedFestival.regionName }}</span>
          <dl>
            <div>
              <dt><CalendarDays :size="17" /> {{ t("festivalCalendar.period") }}</dt>
              <dd>{{ festivalDateRange(selectedFestival) }}</dd>
            </div>
            <div>
              <dt><MapPin :size="17" /> {{ t("festivalCalendar.place") }}</dt>
              <dd>{{ selectedFestival.eventplace || selectedFestival.addr2 || t("festivalCalendar.placeUnknown") }}</dd>
            </div>
            <div>
              <dt><MapPin :size="17" /> {{ t("festivalCalendar.address") }}</dt>
              <dd>{{ selectedFestival.addr1 || t("tours.addressUnknown") }}</dd>
            </div>
            <div>
              <dt><Phone :size="17" /> {{ t("festivalCalendar.contact") }}</dt>
              <dd>{{ selectedFestival.tel || t("festivalCalendar.phoneUnknown") }}</dd>
            </div>
          </dl>
          <RouterLink class="primary-button" :to="`/tours/${selectedFestival.contentid}`">
            {{ t("festivalCalendar.viewDetail") }}
          </RouterLink>
        </div>
      </div>
    </AppModal>
  </section>
</template>
