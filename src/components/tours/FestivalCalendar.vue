<script setup>
import { computed, reactive, ref, watch } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import koLocale from "@fullcalendar/core/locales/ko";
import { CalendarDays, MapPin, Phone } from "@lucide/vue";
import AppModal from "../common/AppModal.vue";
import { fallbackImage, onImageError } from "../../utils/format";

const props = defineProps({
  festivals: { type: Array, default: () => [] },
});

const regionOptions = [
  { value: "", label: "전체" },
  { value: "3", label: "대전" },
  { value: "8", label: "세종" },
  { value: "33", label: "충북" },
  { value: "34", label: "충남" },
];

const regionNames = Object.fromEntries(regionOptions.map((option) => [option.value, option.label]));
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
  if (!normalized) return "일정 정보 없음";
  const [year, month, day] = normalized.split("-");
  return `${year}.${month}.${day}`;
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
      regionName: regionNames[areaCode] || "기타 지역",
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

const calendarEvents = computed(() =>
  scheduledFestivals.value.map((festival) => ({
    id: String(festival.contentid),
    title: festival.title,
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
  if (!festival?.start) return "일정 정보 없음";
  const start = formatDisplayDate(festival.start);
  const end = formatDisplayDate(festival.inclusiveEnd);
  return start === end ? start : `${start} ~ ${end}`;
}

const calendarOptions = reactive({
  plugins: [dayGridPlugin],
  locale: koLocale,
  initialView: "dayGridMonth",
  initialDate: calendarEvents.value[0]?.start,
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "",
  },
  buttonText: { today: "오늘" },
  displayEventTime: false,
  fixedWeekCount: false,
  dayMaxEvents: 3,
  moreLinkText: (count) => `+${count}개`,
  events: calendarEvents.value,
  eventClick: openFestival,
});

watch(calendarEvents, (events) => {
  calendarOptions.events = events;
});
</script>

<template>
  <section class="festival-calendar-shell">
    <div class="festival-filter-bar">
      <div>
        <p class="section-kicker">FESTIVAL CALENDAR</p>
        <h2>권역별 축제 일정</h2>
        <p>날짜가 등록된 축제를 월간 캘린더에서 확인해보세요.</p>
      </div>
      <div class="festival-region-filter" aria-label="축제 권역 필터">
        <button
          v-for="option in regionOptions"
          :key="option.value"
          type="button"
          :class="{ active: selectedRegion === option.value }"
          :disabled="option.value && regionCount(option.value) === 0"
          @click="selectedRegion = option.value"
        >
          {{ option.label }} <small>{{ regionCount(option.value) }}</small>
        </button>
      </div>
    </div>

    <div class="festival-calendar-summary">
      <span><CalendarDays :size="16" /> 일정 등록 {{ scheduledFestivals.length }}개</span>
      <span v-if="unscheduledFestivals.length">일정 미등록 {{ unscheduledFestivals.length }}개</span>
    </div>

    <div class="festival-calendar-wrap">
      <FullCalendar :options="calendarOptions" />
    </div>

    <section v-if="unscheduledFestivals.length" class="unscheduled-festivals">
      <div class="unscheduled-heading">
        <div>
          <p class="section-kicker">DATE PENDING</p>
          <h3>일정 정보가 아직 없는 축제</h3>
        </div>
        <span>{{ unscheduledFestivals.length }}개</span>
      </div>
      <div class="unscheduled-festival-list">
        <RouterLink
          v-for="festival in unscheduledFestivals"
          :key="festival.contentid"
          :to="`/tours/${festival.contentid}`"
        >
          <strong>{{ festival.title }}</strong>
          <small><MapPin :size="13" /> {{ festival.regionName }} · {{ festival.addr1 || "주소 정보 없음" }}</small>
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
          :alt="`${selectedFestival.title} 축제 사진`"
          @error="onImageError"
        />
        <div class="festival-detail-info">
          <span class="festival-region-badge">{{ selectedFestival.regionName }}</span>
          <dl>
            <div>
              <dt><CalendarDays :size="17" /> 기간</dt>
              <dd>{{ festivalDateRange(selectedFestival) }}</dd>
            </div>
            <div>
              <dt><MapPin :size="17" /> 장소</dt>
              <dd>{{ selectedFestival.eventplace || selectedFestival.addr2 || "행사 장소 정보 없음" }}</dd>
            </div>
            <div>
              <dt><MapPin :size="17" /> 주소</dt>
              <dd>{{ selectedFestival.addr1 || "주소 정보 없음" }}</dd>
            </div>
            <div>
              <dt><Phone :size="17" /> 문의</dt>
              <dd>{{ selectedFestival.tel || "전화번호 정보 없음" }}</dd>
            </div>
          </dl>
          <RouterLink class="primary-button" :to="`/tours/${selectedFestival.contentid}`">
            상세 정보 보기
          </RouterLink>
        </div>
      </div>
    </AppModal>
  </section>
</template>
