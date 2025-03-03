import { getFetchInstance, endpoints } from "../utils/axios";
import { Field, Info, Meta, SiteLang } from "../type";
import { StaticData } from "@/lib/data";
const instance = getFetchInstance();
const resourceInstance = getFetchInstance(
  process.env.NEXT_PUBLIC_RESOURCE_WEBSITE_ID
);

function generateBaseFieldMap(fields: Field[]) {
  return (
    fields?.reduce((pre, field) => {
      if (field.type === "object" && field.value) {
        try {
          field.value = JSON.parse(field.value);
        } catch (e) {
          console.error(e);
        }
        pre[field.name] = field.value;
        return pre;
      }
      pre[field.name] = field.value;
      return pre;
    }, {} as Record<string, any>) || {}
  );
}

export const staticDataFetcher = (lang: string): Promise<StaticData> => {
  return instance
    .get<{ data: Meta }>(`${lang}/` + endpoints.staticData)
    .then((r) => generateBaseFieldMap(r.data.fields))
    .then((r) => {
      return r.i18n || {};
    });
};

export const fieldFetcher = (lang: string, name: string, field: string) =>
  resourceInstance
    .get<{
      data: Field;
    }>(
      `${lang}/` +
        endpoints.field.replace("{name}", name).replace("{field}", field)
    )
    .then((r) => {
      return generateBaseFieldMap([r.data]);
    });

export const langFieldFetcher = (lang: string) => {
  return instance
    .get<{ data: Meta }>(`${lang}/` + endpoints.configLangs)
    .then((r) => generateBaseFieldMap(r.data.fields));
};

export const infoFetcher = (lang: string) =>
  instance
    .get<{ data: Info }>(`/${lang}/` + endpoints.info)
    .then((r) => r.data);

export const metaFetcher = (lang: string) =>
  instance
    .get<{ data: Meta }>(`${lang}/${endpoints.meta}`)
    .then((r) => generateBaseFieldMap(r.data.fields));

export const scriptFetcher = (lang: string) =>
  instance
    .get<{ data: Meta }>(`/${lang}/${endpoints.script}`)
    .then((r) => {
      return r.data?.fields || [];
    })
    .catch(() => {
      return [];
    });

export const langsFetcher = () =>
  instance.get<{ data: SiteLang[] }>(endpoints.langs).then((r) => r.data);

export const websiteFetcher = (lang: string) =>
  instance
    .get<{ data: SiteLang }>(`${lang}/` + endpoints.website)
    .then((r) => r.data);
