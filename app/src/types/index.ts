export type Status = 'tracking' | 'active_conversation' | 'passed';
export type EntityType = 'company' | 'partner';
export type Category = 'functional_health' | 'beauty' | 'tea_coffee';

export interface Entity {
  id: string;
  type: EntityType;
  category: Category | null;
  categories: Category[];
  name: string;
  website: string | null;
  logo_url: string | null;
  og_image: string | null;
  description: string | null;
  status: Status;
  created_at: string;
}

export interface Note {
  id: string;
  entity_id: string;
  content: string;
  author: string | null;
  created_at: string;
}
