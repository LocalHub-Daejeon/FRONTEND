<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Camera, Check, Copy, MessageCircle, MessageSquare, Share2, X as XIcon } from "@lucide/vue";
import { loadKakao } from "../../utils/kakao";

const { t } = useI18n();

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  url: { type: String, default: () => window.location.href },
});

const open = ref(false);
const root = ref(null);
const kakaoReady = ref(false);
const copied = ref(false);
const instagramNotice = ref(false);
let copyTimer = null;
let instagramTimer = null;

onMounted(async () => {
  document.addEventListener("click", handleClickOutside);
  const Kakao = await loadKakao().catch(() => null);
  kakaoReady.value = Boolean(Kakao);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  clearTimeout(copyTimer);
  clearTimeout(instagramTimer);
});

function handleClickOutside(event) {
  if (root.value && !root.value.contains(event.target)) closeMenu();
}

function toggle() {
  open.value = !open.value;
}

function closeMenu() {
  open.value = false;
  copied.value = false;
  instagramNotice.value = false;
}

function shareKakao() {
  if (!window.Kakao?.isInitialized()) return;
  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: props.title,
      description: props.description,
      imageUrl: props.imageUrl,
      link: { mobileWebUrl: props.url, webUrl: props.url },
    },
    buttons: [
      { title: t("common.share.viewMore"), link: { mobileWebUrl: props.url, webUrl: props.url } },
    ],
  });
  closeMenu();
}

function shareFacebook() {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`;
  window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=520");
  closeMenu();
}

function shareTwitter() {
  const text = props.description ? `${props.title} - ${props.description}` : props.title;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(props.url)}`;
  window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=520");
  closeMenu();
}

function shareMessage() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? "&" : "?";
  const body = encodeURIComponent(`${props.title} ${props.url}`);
  window.location.href = `sms:${separator}body=${body}`;
  closeMenu();
}

async function writeToClipboard() {
  try {
    await navigator.clipboard.writeText(props.url);
    return true;
  } catch {
    return false;
  }
}

async function handleCopyLink() {
  if (!(await writeToClipboard())) return;
  copied.value = true;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(closeMenu, 1200);
}

async function handleInstagram() {
  if (!(await writeToClipboard())) return;
  instagramNotice.value = true;
  clearTimeout(instagramTimer);
  instagramTimer = setTimeout(closeMenu, 2400);
}
</script>

<template>
  <div ref="root" class="share-menu">
    <button
      type="button"
      class="share-trigger"
      :aria-label="t('common.share.label')"
      :aria-expanded="open"
      @click="toggle"
    >
      <Share2 :size="16" /> {{ t("common.share.label") }}
    </button>

    <Transition name="share-pop">
      <div v-if="open" class="share-dropdown" role="menu">
        <button v-if="kakaoReady" type="button" class="share-option" role="menuitem" @click="shareKakao">
          <span class="share-icon-badge kakao-badge"><MessageCircle :size="16" /></span>
          {{ t("common.share.kakao") }}
        </button>
        <button type="button" class="share-option" role="menuitem" @click="shareMessage">
          <span class="share-icon-badge message-badge"><MessageSquare :size="16" /></span>
          {{ t("common.share.message") }}
        </button>
        <button type="button" class="share-option" role="menuitem" @click="shareFacebook">
          <span class="share-icon-badge facebook-badge">f</span>
          {{ t("common.share.facebook") }}
        </button>
        <button type="button" class="share-option" role="menuitem" @click="shareTwitter">
          <span class="share-icon-badge twitter-badge"><XIcon :size="14" /></span>
          {{ t("common.share.twitter") }}
        </button>
        <button type="button" class="share-option" role="menuitem" @click="handleInstagram">
          <span class="share-icon-badge instagram-badge"><Camera :size="16" /></span>
          {{ instagramNotice ? t("common.share.instagramNotice") : t("common.share.instagram") }}
        </button>
        <button type="button" class="share-option" role="menuitem" @click="handleCopyLink">
          <span class="share-icon-badge copy-badge">
            <Check v-if="copied" :size="16" />
            <Copy v-else :size="16" />
          </span>
          {{ copied ? t("common.share.copied") : t("common.share.copyLink") }}
        </button>
      </div>
    </Transition>
  </div>
</template>
