/* --------------------------------------------------------------------
   DynamicFields – rend le sous-formulaire spécialisé selon le slug
--------------------------------------------------------------------- */

import React from 'react';

/* ---- Imports des sous-formulaires spécialisés -------------------- */
import { RamFields,       RamData       } from './RamFields';
import CpuFields,         { CpuData      } from './CpuFields';
import HddFields,         { HddData      } from './HddFields';
import PsuFields,         { PsuData      } from './PsuFields';
import MoboFields,        { MoboData     } from './MoboFields';
import NicFields,         { NicData      } from './NicFields';
import GraphicCardFields, { GraphicCardData } from './GraphicCardFields';
import LicenseFields,     { LicenseData  } from './LicenseFields';
import SoftwareFields,    { SoftwareData } from './SoftwareFields';
import AccessoryFields,   { AccessoryData} from './AccessoryFields';
import LaptopFields,      { LaptopData   } from './LaptopFields';
import DesktopFields,     { DesktopData  } from './DesktopFields';
import ServerFields,      { ServerData   } from './ServerFields';

/* ------------- Types utilitaires ---------------------------------- */
type Setter = (field: string, value: any) => void;
type ErrorBag<T> = Partial<Record<keyof T, string>>;

/* ----------- Mapping slug → composant ----------------------------- */
const components = {
  rams:            RamFields,
  ram:             RamFields,          // alias singulier
  processors:      CpuFields,
  processor:       CpuFields,
  hard_drives:     HddFields,
  hard_drive:      HddFields,
  power_supplies:  PsuFields,
  power_supply:    PsuFields,
  motherboards:    MoboFields,
  motherboard:     MoboFields,
  network_cards:   NicFields,
  network_card:    NicFields,
  graphic_cards:   GraphicCardFields,
  graphic_card:    GraphicCardFields,
  licenses:        LicenseFields,
  license:         LicenseFields,
  softwares:       SoftwareFields,
  software:        SoftwareFields,
  accessories:     AccessoryFields,
  accessory:       AccessoryFields,
  laptops:         LaptopFields,
  laptop:          LaptopFields,
  desktops:        DesktopFields,
  desktop:         DesktopFields,
  servers:         ServerFields,
  server:          ServerFields,
} as const;

/* -------------- Union de toutes les « Data » connues -------------- */
type AllData =
      RamData | CpuData | HddData | PsuData | MoboData | NicData
    | GraphicCardData | LicenseData | SoftwareData | AccessoryData
    | LaptopData | DesktopData | ServerData
    | Record<string, any>;  // fallback

/* --------------------- Props du composant maître ------------------ */
export interface DynamicFieldsProps {
  slug:   keyof typeof components;
  data:   AllData;
  setData: Setter;
  errors?: ErrorBag<any>;
}

/* ---------------------- Composant maître -------------------------- */
export default function DynamicFields({
  slug, data, setData, errors = {},
}: DynamicFieldsProps) {
  const Component = components[slug];
  if (!Component) return null;         // slug inconnu → rien à rendre

  return (
    <Component
      data={data as any}
      setData={setData}
      errors={errors}
    />
  );
}
