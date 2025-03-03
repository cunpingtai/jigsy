export type Field = {
  type: string;
  name: string;
  value: any;
};

export type Lang = {
  value: string;
  name: string;
};

export type SiteLang = {
  website_id: string;
  site_id: number;
  domain: string;
  default: boolean;
  lang: Lang;
};

export type Resource = {
  id: number;
  site_id: number;
  url: string;
  original: string;
  name: string;
};

export type Meta = {
  name: "meta";
  fields: Field[];
};

export type Info = {
  id: number;
  website_id: string;
  site_id: number;
  lang_id: number;
  name: string;
  domain: string | null;
  description: string;
  created_at: string;
  updated_at: string;
  lang: { id: number; name: string; value: string };
};
