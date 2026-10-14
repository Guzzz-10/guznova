import "server-only";
import { cache } from "react";
import { prisma } from "./db";
import { SETTINGS_DEFAULTS, type Settings } from "./settings-defaults";

/** Configuración del negocio (BD + valores por defecto). Cacheada por request. */
export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await prisma.setting.findMany();
  const settings = { ...SETTINGS_DEFAULTS } as Settings;
  for (const row of rows) {
    if (row.key in settings) settings[row.key as keyof Settings] = row.value;
  }
  return settings;
});
