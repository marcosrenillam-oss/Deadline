import { Sheet } from '../../ui/Sheet.tsx';
import { NotebookEditor } from '../notebook/NotebookEditor.tsx';

export function NotebookPanel({ open, onClose, caseId }: { open: boolean; onClose: () => void; caseId: string }) {
  return (
    <Sheet open={open} onClose={onClose} title="Libreta">
      <NotebookEditor caseId={caseId} />
    </Sheet>
  );
}
