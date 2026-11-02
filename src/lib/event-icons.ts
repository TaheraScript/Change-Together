import {
  BookOpen,
  CalendarDays,
  Gift,
  Snowflake,
  Stethoscope,
  Trash2,
  TreePine,
  Users,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const EVENT_TYPE_ICONS: Record<string, LucideIcon> = {
  Cleanup: Trash2,
  Plantation: TreePine,
  Donation: Gift,
  "Winter Relief": Snowflake,
  "Food Drive": Utensils,
  "Health Camp": Stethoscope,
  Education: BookOpen,
  "Community Support": Users,
};

export function getEventTypeIcon(type: string): LucideIcon {
  return EVENT_TYPE_ICONS[type] ?? CalendarDays;
}
