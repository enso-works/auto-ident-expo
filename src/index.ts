import IdNowAutoIdentModule from "./IdNowAutoIdentModule";

export enum IdNowLanguage {
  bg = "bg", // Bulgarian
  cs = "cs", // Czech
  da = "da", // Danish
  de = "de", // German
  el = "el", // Greek
  en = "en", // English
  es = "es", // Spanish
  et = "et", // Estonian
  fi = "fi", // Finnish
  fr = "fr", // French
  hr = "hr", // Croatian
  hu = "hu", // Hungarian
  it = "it", // Italian
  ja = "ja", // Japanese
  ka = "ka", // Georgian
  ko = "ko", // Korean
  lt = "lt", // Lithuanian
  lv = "lv", // Latvian
  nb = "nb", // Norwegian
  nl = "nl", // Dutch
  pl = "pl", // Polish
  pt = "pt", // Portuguese
  ro = "ro", // Romanian
  ru = "ru", // Russian
  sk = "sk", // Slovak
  sl = "sl", // Slovenian
  sr = "sr", // Serbian
  sv = "sv", // Swedish
  tr = "tr", // Turkish
  zh = "zh", // Chinese
}

export type AutoIdentResult = {
  status: "CANCELLED" | "FINISHED" | "ERROR" | "UNKNOWN";
  errorCode: keyof typeof AutoIdentResponseDescriptions;
};

export async function startAutoIdent(
  token: string,
  language: IdNowLanguage = IdNowLanguage.en,
) {
  const identOBJ = await IdNowAutoIdentModule.start(token, language);

  try {
    return JSON.parse(identOBJ) as AutoIdentResult;
  } catch {
    return null;
  }
}

export async function autoIdentInitAndroid(
  language: IdNowLanguage = IdNowLanguage.en,
) {
  return await IdNowAutoIdentModule.init(language);
}

export const AutoIdentResponseDescriptions = {
  E1000: "Ident code syntax incorrect",
  E100: "Ident code syntax incorrect",
  E101: "Ident code not found",
  E102: "Ident code expired",
  E103: "Ident code already completed",
  E110: "Get ident info failed; invalid response",
  E111: "Get ident info failed; server reachability",
  E130: "Get ident resources failed; invalid response",
  E131: "Get ident resources failed; server reachability",
  E140: "Get name failed; invalid response",
  E141: "Get name failed; server reachability",
  E142: "Get name failed; full name missing",
  E150: "Start ident failed; invalid response",
  E151: "Start ident failed; server reachability",
  E152: "Start ident failed; missing session key",
  E153: "Start ident failed; wrong ident method",
  E160: "Get Emirates NFC resources failed; invalid response",
  E161: "Get Emirates NFC resources failed; server reachability",
  E170: "Socket connection force closed",
  E171: "Process force closed",
  E180: "Missing application context",
};
