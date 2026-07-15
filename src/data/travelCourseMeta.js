export const courseAreaOptions = [
  { value: "", label: "전체" },
  { value: "3", label: "대전" },
  { value: "34", label: "충남" },
  { value: "33", label: "충북" },
];

export const courseThemeOptions = [
  { value: "", label: "전체" },
  { value: "C0112", label: "가족" },
  { value: "C0114", label: "힐링" },
  { value: "C0115", label: "도보" },
  { value: "C0116", label: "캠핑" },
];

const courseMetaById = {
  "2360837": { areaCode: "3", themeCode: "C0112", sigunguCode: "" },
  "2046868": { areaCode: "3", themeCode: "C0112", sigunguCode: "" },
  "2605958": { areaCode: "3", themeCode: "C0114", sigunguCode: "2" },
  "1888985": { areaCode: "3", themeCode: "C0114", sigunguCode: "3" },
  "1888965": { areaCode: "3", themeCode: "C0114", sigunguCode: "4" },
  "1928006": { areaCode: "3", themeCode: "C0112", sigunguCode: "3" },
  "1978169": { areaCode: "3", themeCode: "C0112", sigunguCode: "4" },
  "2050421": { areaCode: "3", themeCode: "C0115", sigunguCode: "5" },
  "1927292": { areaCode: "3", themeCode: "C0112", sigunguCode: "3" },
  "1978176": { areaCode: "3", themeCode: "C0112", sigunguCode: "4" },
  "1978170": { areaCode: "3", themeCode: "C0112", sigunguCode: "5" },
  "2384827": { areaCode: "3", themeCode: "C0112", sigunguCode: "4" },
  "1978173": { areaCode: "3", themeCode: "C0114", sigunguCode: "2" },
  "1937803": { areaCode: "34", themeCode: "C0116", sigunguCode: "16" },
  "2390869": { areaCode: "34", themeCode: "C0116", sigunguCode: "1" },
  "1927995": { areaCode: "34", themeCode: "C0114", sigunguCode: "1" },
  "1936020": { areaCode: "34", themeCode: "C0112", sigunguCode: "1" },
  "2037011": { areaCode: "34", themeCode: "C0112", sigunguCode: "1" },
  "2371994": { areaCode: "34", themeCode: "C0112", sigunguCode: "1" },
  "1854485": { areaCode: "34", themeCode: "C0112", sigunguCode: "1" },
  "1968521": { areaCode: "34", themeCode: "C0112", sigunguCode: "1" },
  "1854246": { areaCode: "34", themeCode: "C0112", sigunguCode: "1" },
  "1937655": { areaCode: "34", themeCode: "C0116", sigunguCode: "3" },
  "1854609": { areaCode: "33", themeCode: "C0114", sigunguCode: "5" },
  "1941551": { areaCode: "33", themeCode: "C0114", sigunguCode: "5" },
  "2047558": { areaCode: "33", themeCode: "C0114", sigunguCode: "5" },
  "2717311": { areaCode: "33", themeCode: "C0114", sigunguCode: "5" },
  "1945189": { areaCode: "33", themeCode: "C0112", sigunguCode: "5" },
};

const areaNames = Object.fromEntries(courseAreaOptions.map((option) => [option.value, option.label]));
const themeNames = Object.fromEntries(courseThemeOptions.map((option) => [option.value, option.label]));

export function enrichTravelCourse(course) {
  const meta = courseMetaById[String(course.contentid)] || {};
  const areaCode = String(course.areacode || meta.areaCode || "");
  const themeCode = String(course.cat2 || meta.themeCode || "");

  return {
    ...course,
    areaCode,
    areaName: areaNames[areaCode] || "지역 미분류",
    themeCode,
    themeName: themeNames[themeCode] || "테마 미분류",
    sigunguCode: String(course.sigungucode || meta.sigunguCode || ""),
  };
}
