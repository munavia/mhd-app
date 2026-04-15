import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { AbstractIntlMessages } from "next-intl";

function merge(...parts: AbstractIntlMessages[]): AbstractIntlMessages {
  return Object.assign({}, ...parts);
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as never)) {
    locale = routing.defaultLocale;
  }

  const [core, siteA, siteB, dashboard] = await Promise.all([
    import(`../messages/${locale}-core.json`),
    import(`../messages/${locale}-site-a.json`),
    import(`../messages/${locale}-site-b.json`),
    import(`../messages/${locale}-dashboard.json`),
  ]);

  return {
    locale,
    messages: merge(
      core.default,
      siteA.default,
      siteB.default,
      dashboard.default
    ),
  };
});
