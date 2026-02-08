// This component can be expanded later for admin functionality
// For now, it's a placeholder to show the concept

export interface AdminNoteProps {
  tripId: string;
  notes: string;
}

export function AdminNote({ tripId, notes }: AdminNoteProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="text-xs font-medium text-blue-900 mb-1">Admin Notes:</p>
      <p className="text-sm text-blue-800">{notes}</p>
    </div>
  );
}
