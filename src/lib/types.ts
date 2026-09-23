import type { Database } from "@/integrations/supabase/types";

type T = Database["public"]["Tables"];

export type Campaign = T["campaigns"]["Row"];
export type Category = T["categories"]["Row"];
export type Donation = T["donations"]["Row"];
export type Testimonial = T["testimonials"]["Row"];
export type Faq = T["faqs"]["Row"];
export type DropOffPoint = T["drop_off_points"]["Row"];
export type TransparencyReport = T["transparency_reports"]["Row"];
export type Profile = T["profiles"]["Row"];

export type CampaignWithCategory = Campaign & {
  categories: Pick<Category, "name" | "slug" | "accent"> | null;
};
