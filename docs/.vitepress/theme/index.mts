import type { Theme, EnhanceAppContext } from "vitepress";
import DefaultTheme from "vitepress/theme";
import TwoslashFloatingVue from "@shikijs/vitepress-twoslash/client";
import "@shikijs/vitepress-twoslash/style.css";
import "./style.css";

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(TwoslashFloatingVue as never);
  },
};
export default theme;
