import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

dotenv.config();

const HOST_API = process.env.HOST_API;
const WEBSITE_ID = process.env.NEXT_PUBLIC_WEBSITE_ID;
const STATIC_DOMAIN = process.env.NEXT_PUBLIC_STATIC_DOMAIN;

function setAxiosInstance(instance) {
  instance.interceptors.response.use((r) => r.data);
}
const axiosInstance = axios.create({
  baseURL: HOST_API + `/web-start/v1/api/nhs-client/s/${WEBSITE_ID}`,
});

const axiosCommonInstance = axios.create({
  baseURL: HOST_API + `/web-start/v1/api/nhs-client`,
});

setAxiosInstance(axiosInstance);
setAxiosInstance(axiosCommonInstance);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, "public");

if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

async function downloadFiles(files) {
  if (!files) return;
  for (const field of files) {
    try {
      const ext = path.extname(field.value);
      const resourcePath = path.resolve(
        __dirname,
        "./public",
        `${field.name}${ext}`
      );
      const originPath = `${STATIC_DOMAIN}/${field.value}`;
      const response = await axios.get(originPath, {
        responseType: "stream",
      });

      const stream = fs.createWriteStream(resourcePath);
      response.data.pipe(stream);
      // 处理错误
      stream.on("error", (err) => {
        console.error("下载资源时出错:", err.message);
      });
    } catch (err) {
      console.error("Axios请求远程资源时出错:", `${err.message}`);
    }
  }
}

async function downloadStaticResource(lang) {
  try {
    const result = await axiosInstance.get(`/${lang}` + "/c/__STATIC__");
    const {
      data: { fields: statics },
    } = result;
    downloadFiles(statics);
  } catch (e) {
    console.error("downloadStaticResource", e.message);
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async () => {
  try {
    const { data } = await axiosInstance.get("/langs");
    let defaultLang = data.find((lang) => lang.default);
    const otherLang = data.filter((lang) => !lang.default);
    defaultLang = defaultLang || otherLang[0];

    fs.writeFileSync(
      "./languages.json",
      JSON.stringify({
        languages: [
          defaultLang.lang.value,
          ...otherLang.map((lang) => lang.lang.value),
        ],
        fallbackLng: defaultLang.lang.value,
      })
    );
    downloadStaticResource(defaultLang.lang.value);
  } catch (e) {
    console.error("languages", e.message);
  }
};
