import { BattlePage } from "@/pages/battle.page";
import { MapSelectPage } from "@/pages/map-select.page";
import { ResultPage } from "@/pages/result.page";
import { SettingsPage } from "@/pages/settings.page";
import { TitlePage } from "@/pages/title.page";
import { WorkshopPage } from "@/pages/workshop.page";
import { test as core } from "./core.fixture";

// One fixture per page object, named like the class in camelCase. Duck Defense is one URL: every screen is reached
// from the title through the UI, so specs usually take titlePage plus the screen they land on.
export const test = core.extend<{
  titlePage: TitlePage;
  battlePage: BattlePage;
  mapSelectPage: MapSelectPage;
  workshopPage: WorkshopPage;
  settingsPage: SettingsPage;
  resultPage: ResultPage;
}>({
  titlePage: async ({ page }, use) => use(new TitlePage(page)),
  battlePage: async ({ page }, use) => use(new BattlePage(page)),
  mapSelectPage: async ({ page }, use) => use(new MapSelectPage(page)),
  workshopPage: async ({ page }, use) => use(new WorkshopPage(page)),
  settingsPage: async ({ page }, use) => use(new SettingsPage(page)),
  resultPage: async ({ page }, use) => use(new ResultPage(page)),
});
