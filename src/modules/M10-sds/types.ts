// M10 SDS listovi — Safety Data Sheets za opasne tvari
export type SdsDocumentRow = {
  id: string; tenant_id: string; chemical_name: string; cas_number: string | null
  supplier: string | null; location: string | null; hazard_classes: string[] | null
  received_date: string | null; expiry_date: string | null; document_url: string | null
  notes: string | null; status: string; created_at: string; updated_at: string
  created_by: string | null; updated_by: string | null
}
