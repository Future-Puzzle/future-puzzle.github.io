/// Time capsule page scripts
import {
  hideModal,
  showBlobModal,
  showErrorModal,
  showImageModal,
  showTextModal
} from '@/scripts/time-capsule-modal';
import { Base64 } from 'js-base64';
import { sha256 } from 'js-sha256';

// On click query button
document
  .querySelector<HTMLButtonElement>('#query-btn')!
  .addEventListener('click', (): void => {
    // Disable button
    document.querySelector<HTMLButtonElement>('#query-btn')!.disabled = true;

    // Get input data
    const id: string =
      document.querySelector<HTMLInputElement>('#entry-id-in')!.value;
    const passwd: string =
      document.querySelector<HTMLInputElement>('#passwd-in')!.value;

    // If any empty
    if (id.length === 0 || passwd.length === 0) {
      showErrorModal("Can't be empty");
      return;
    }

    // Try get
    fetch('/pool/' + sha256(sha256(id) + sha256(passwd)), {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
      .then((res: Response): Promise<string> => {
        if (!res.ok) {
          throw 'Not Found';
        }
        return res.text();
      })
      .then((data: string): void => {
        // Get file name
        const fileName: string | null = data.split('\n', 1)[0] ?? null;
        if (fileName === null) {
          throw 'File Corrupted';
        }
        data = data.slice(fileName.length + 1);

        // Get file mime
        const mime: string | null = data.split('\n', 1)[0] ?? null;
        if (mime === null) {
          throw 'File Corrupted';
        }
        data = data.slice(mime.length + 1);

        // Check mime
        if (mime.startsWith('text')) {
          showTextModal(fileName, data);
        } else if (mime.startsWith('image')) {
          showImageModal(fileName, data);
        } else {
          // Decode data
          const buffer: Uint8Array = Base64.toUint8Array(data);

          showBlobModal();

          const blob: Blob = new Blob([buffer], { type: mime });
          const url: string = URL.createObjectURL(blob);
          const el: HTMLAnchorElement = document.createElement('a');
          el.download = fileName;
          el.href = url;
          el.click();
          URL.revokeObjectURL(url);
        }
      })
      .catch((err: unknown): void => {
        showErrorModal(typeof err === 'string' ? err : 'Error');
      });
  });

// On click modal background
document
  .querySelector<HTMLDivElement>('#modal-bg')!
  .addEventListener('click', hideModal);