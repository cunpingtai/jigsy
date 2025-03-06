import tags from "./tags.json";
import category1 from "./category1.json";
import category2 from "./category2.json";
import category3 from "./category3.json";
import category4 from "./category4.json";
import category5 from "./category5.json";
import category6 from "./category6.json";
import category7 from "./category7.json";
import category8 from "./category8.json";
import category9 from "./category9.json";
import category10 from "./category10.json";
import category11 from "./category11.json";
import category12 from "./category12.json";

export const data = {
  prompt: `{category}, {group}, "{tags}"
  Generate a paragraph of around 100 words based on the category, group, and tags`,
  country: "United States",
  tags,
  categories: [
    category1,
    category2,
    category3,
    category4,
    category5,
    category6,
    category7,
    category8,
    category9,
    category10,
    category11,
    category12,
  ],
};
